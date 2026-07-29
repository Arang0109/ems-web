# 배포 (deploy)

EMS 개발 서버는 단일 EC2(t4g.medium, ARM64, 4GB)에 docker-compose 5개 컨테이너
(frontend·backend·mysql·redis·mongo)로 운영한다. 이미지는 로컬(Windows)에서
arm64로 빌드해 EC2로 전송하는 방식이다.

인프라(compose·`.env`)는 이 디렉토리 한 곳에서 소유한다. 프론트·백엔드는 각각
자기 이미지만 재배포하며 서로의 컨테이너를 건드리지 않는다.

## 파일

| 파일 | 설명 |
|------|------|
| `docker-compose.yml` | EC2에서 5개 서비스를 띄우는 compose 정의 (EC2에 배치) |
| `.env.example` | EC2 시크릿(`JWT_SECRET`·`DB_PASSWORD`·`PLATFORM_*` 등) 템플릿 → EC2에서 `.env` 로 |
| `redeploy-frontend.sh` | **프론트 수정 후 frontend 컨테이너만 재배포**하는 로컬 스크립트 |
| `redeploy-backend.sh` | **백엔드 수정 후 backend 컨테이너만 재배포**하는 로컬 스크립트 |
| `redeploy-db.sh` | **DB(mysql·redis·mongo) 컨테이너 재배포 + 선택적 데이터 초기화** 로컬 스크립트 |
| `_lib.sh` | 위 스크립트들의 공용 함수 (빌드·전송·재기동·스모크 테스트). 단독 실행용이 아니다 |
| `deploy.local.sh.example` | 재배포 스크립트용 접속 정보 템플릿 |

---

## 최초 1회 준비

접속 정보 파일을 만든다. `deploy.local.sh` 는 `.gitignore` 의 `deploy/deploy.local.sh`
항목으로 커밋되지 않는다.

```bash
cp deploy/deploy.local.sh.example deploy/deploy.local.sh
# deploy/deploy.local.sh 를 열어 EC2 IP·SSH 키 경로·원격 디렉토리·서버 저장소 경로를 채운다
```

두 스크립트가 이 파일 하나를 공유한다. `SERVER_REPO`(백엔드 저장소 경로)는
`redeploy-backend.sh` 만 사용한다.

### 사전 요구사항 (로컬)

- Git Bash — 스크립트는 bash로 작성돼 있다
- Docker Desktop (buildx 포함) — 실행 중이어야 한다
- OpenSSH 클라이언트(`ssh`, `scp`) — Windows 10/11 기본 포함
- 백엔드 배포 시: WSL(Ubuntu-22.04)이 실행 중이어야 한다 (UNC 경로로 소스를 읽음)

---

## 프론트 재배포

```bash
# 프론트 코드 수정 후
./deploy/redeploy-frontend.sh
```

1. 타입체크 (`npx tsc -b`, `--skip-typecheck` 로 생략 가능)
2. arm64 이미지 빌드 (`docker buildx ... --platform linux/arm64 -t ems-web:arm64`)
3. 이미지 저장 (`docker save` → tar)
4. `scp` 로 EC2 `/tmp` 전송
5. EC2에서 `docker load` 후 **frontend 컨테이너만** `docker compose up -d --force-recreate frontend`
6. 로컬 임시파일 정리 + `http://<host>/` 스모크 테스트

> DB·백엔드 컨테이너는 재기동되지 않는다.

---

## 백엔드 재배포

```bash
# 백엔드(ems-server) 코드 수정 후
./deploy/redeploy-backend.sh
```

1. arm64 이미지 빌드 — 빌드 컨텍스트는 `SERVER_REPO`(WSL의 UNC 경로).
   Docker 안에서 `gradle bootJar` 가 돌아 컴파일까지 검증하므로 별도 타입체크 단계가 없다.
   **수 분 걸린다.**
2. 이미지 저장 (`docker save` → tar)
3. `scp` 로 EC2 `/tmp` 전송
4. EC2에서 `docker load` 후 **backend 컨테이너만** `docker compose up -d --force-recreate backend`
   → 이어서 `docker compose logs backend --tail 40` 출력
5. 로컬 임시파일 정리 + 스모크 테스트

> mysql·redis·mongo·frontend 컨테이너는 재기동되지 않는다.

**스모크 테스트가 프론트와 다른 이유:** backend는 외부 포트가 없고(내부 `:8080`),
Spring 기동에 30~60초가 걸린다. 그래서 frontend nginx의 `/api` 프록시를 통해
최대 120초 폴링한다. `502`/`504`는 아직 기동 중으로 보고 재시도하며, 그 외 응답
(`401`·`403`·`404` 등)은 백엔드가 요청을 처리했다는 뜻이므로 성공으로 판정한다.

### 프론트·백엔드 둘 다 배포

두 스크립트를 순서대로 실행하면 된다.

```bash
./deploy/redeploy-backend.sh
./deploy/redeploy-frontend.sh
```

---

## DB 재배포

```bash
./deploy/redeploy-db.sh                    # mysql·redis·mongo 전부 (데이터 보존)
./deploy/redeploy-db.sh mysql              # 지정 서비스만
./deploy/redeploy-db.sh mysql redis        # 복수 지정 가능
./deploy/redeploy-db.sh mysql --reset-data # 데이터 초기화 포함 (확인 프롬프트)
```

**언제 쓰나:** `docker-compose.yml` 의 DB 설정 변경(메모리 캡·command 플래그 등),
DB 이미지 버전업, 개발 데이터 초기화.

**프론트·백엔드와 다른 점 — 빌드·전송이 없다.** DB는 공식 이미지(mysql:8.0,
redis:7-alpine, mongo:7)라 로컬 arm64 빌드가 필요 없고, EC2가 Docker Hub에서
직접 pull 한다(arm64 네이티브).

1. 최신 `docker-compose.yml` 을 EC2로 `scp` (compose 정의는 이 저장소가 소유)
2. (`--reset-data` 시) 대상 컨테이너 stop·rm 후 `/data/<서비스>` 볼륨 내용 삭제
3. `docker compose pull` → **대상 DB 컨테이너만** `up -d --force-recreate`
4. DB 헬스체크 폴링 (mysqladmin ping / redis-cli ping / mongosh ping, 최대 120초)
5. **backend 자동 재기동** (`up -d --force-recreate backend`) — DB 재생성 직후의
   재연결 이슈를 원천 차단하고 `.env` 를 다시 읽는다. `restart` 가 아닌 이유:
   `restart` 는 `.env` 변경(예: `PLATFORM_BOOTSTRAP_ENABLED`)을 반영하지 못한다.
6. 스모크 테스트(`/api` 프록시 경유, 백엔드 재배포와 동일 판정) + backend 로그 출력

> frontend 컨테이너는 재기동되지 않는다.

### `--reset-data` 주의사항

`/data/<서비스>` 볼륨 내용을 지우는 **파괴적 동작**이다. 실수 방지를 위해
삭제 대상 경로를 보여주고 **서비스 목록을 그대로 타이핑해야** 진행된다.

- 서버가 `ddl-auto: update` 라 MySQL 스키마는 backend 재기동 시 자동 재생성된다.
- **MySQL 초기화 시 운영자 계정도 사라진다.** 재생성하려면 실행 **전에** EC2 `.env` 의
  `PLATFORM_BOOTSTRAP_ENABLED=true` + `USERNAME`/`PASSWORD` 를 확인한다 —
  스크립트가 backend 를 재기동하며 `.env` 를 다시 읽으므로 별도 배포 없이 반영된다.
  ([운영자 계정 최초 생성](#운영자platform-admin-계정-최초-생성) 참고. 확인 후
  `false` 로 되돌리는 것도 잊지 말 것.)
- `MYSQL_DATABASE`/`MYSQL_USER` 등 초기화 env는 datadir이 빈 경우에만 적용되므로
  초기화 후 첫 기동 때 자동으로 다시 적용된다.

---

## 운영자(platform-admin) 계정 최초 생성

서버의 `PlatformAdminInitializer`(ApplicationRunner)가 기동 시
**표준 역할 → 시스템 테넌트 → 운영자 계정** 순으로 생성한다.
(`CustomUserDetailsService` 가 로그인 시 tenantId로 테넌트를 찾으므로 테넌트가 먼저다.)
이미 존재하면 건너뛰는 멱등 로직이라 재기동해도 중복 생성되지 않는다.

값은 `docker-compose.yml` 의 backend `environment:` 를 통해 주입된다.
서버 저장소의 `.env` 는 `.dockerignore` 대상이라 컨테이너 안에 없다 — EC2의
`/home/ec2-user/ems/.env` 가 유일한 주입 경로다.

**순서가 중요하다. compose는 `up` 시점에 `.env` 를 읽으므로 반드시 배포 전에 고친다.**

```bash
# 1) EC2에서 .env 편집
ssh -i <key> ec2-user@<host>
cd /home/ec2-user/ems
vi .env
#   PLATFORM_BOOTSTRAP_ENABLED=true
#   PLATFORM_ADMIN_USERNAME=platform
#   PLATFORM_ADMIN_PASSWORD=<실제 비밀번호>
#   PLATFORM_ADMIN_NAME=운영자
#   PLATFORM_ADMIN_EMAIL=<이메일>
```

```bash
# 2) 백엔드 재배포 (로컬에서)
./deploy/redeploy-backend.sh
```

```bash
# 3) 부트스트랩 성공 확인 — "건너뜁니다" 경고가 아니라 생성 로그가 나와야 한다
docker compose logs backend | grep bootstrap

# 4) 계정 생성 확인 후 비활성화
vi .env          # PLATFORM_BOOTSTRAP_ENABLED=false
docker compose up -d backend
```

주의사항:

- `ENABLED=true` 라도 `USERNAME`/`PASSWORD` 가 비어 있으면 경고만 남기고 조용히 건너뛴다.
- `.env` 는 **EC2에만** 존재하며 절대 커밋하지 않는다. `.env.example` 은 커밋되는
  템플릿이므로 실제 비밀번호를 적지 않는다.
- `PLATFORM_SYSTEM_TENANT_BIZ` — 속성명은 `system-tenant-biz-number` 지만 환경변수는
  `_BIZ` 로 끝난다(`_BIZ_NUMBER` 아님). 하이픈 없는 10자리이며 기존 테넌트와 겹치면 안 된다.
- 한글 값(`운영자`·`플랫폼`)은 compose `environment:` 로 넘어가므로 UTF-8이 유지된다.
  (서버가 `.env` 를 properties 파일로 직접 읽으면 ISO-8859-1로 해석돼 깨진다.)

---

## 참고

- 프론트 Dockerfile은 `npm ci` 대신 `npm install` 을 쓴다(Windows lockfile의 arm64
  optional deps 누락 회피).
- 프로덕션 빌드는 `.env.production`(`VITE_API_URL=/api`, `VITE_ENABLE_MSW=false`)을 적용한다.
  프론트 환경변수는 **빌드 시점에 이미지에 박히므로** 값을 바꾸려면 재빌드해야 한다.
- 백엔드 저장소는 WSL 안에 있으나 WSL의 Docker 통합이 꺼져 있어, Windows Docker Desktop이
  UNC 경로를 빌드 컨텍스트로 읽는다. UNC 컨텍스트가 실패하면 Docker Desktop 설정 >
  Resources > WSL Integration에서 Ubuntu-22.04를 켜고 스크립트를
  `wsl -d Ubuntu-22.04 -- docker buildx build ... <리눅스 경로>` 로 바꾸는 대안이 있다.
- 임시 tar는 `/c/Users/Public/ems-deploy` 에 만든다. `/tmp` 를 쓰면 Git Bash가 이를
  `%LOCALAPPDATA%\Temp` 로 변환해 docker.exe에 넘기는데, 사용자명에 한글이 있으면 경로가 깨진다.
- 메모리 캡은 `mem_limit:` 으로 건다. 예전 문서에 "`deploy.resources.limits` 는 Swarm 전용이라
  `docker compose up` 에서 무시된다"고 적혀 있었으나 **사실이 아니다** — Compose V2는 Swarm 없이도
  이를 적용한다(실제로 `docker stats` 의 LIMIT 열에 반영되는 것을 확인). 둘 다 동작하며
  `mem_limit` 이 더 짧아 이 쪽을 쓴다.
- **코드 변경은 이미지를 재빌드해야만 반영된다.** EC2에서 `docker compose up -d` 를 해도
  기존 이미지로 컨테이너만 다시 만들 뿐이라 코드는 그대로다. 무엇을 고쳤느냐로 판단한다:

  | 고친 것 | 필요한 조치 |
  |---------|-------------|
  | 프론트·백엔드 **코드** | `./deploy/redeploy-frontend.sh` / `redeploy-backend.sh` (재빌드 필수) |
  | `.env` 값 | EC2에서 `docker compose up -d <서비스>` |
  | `docker-compose.yml` 의 DB 서비스 설정 | `./deploy/redeploy-db.sh [서비스]` (scp + pull + 재생성까지 수행) |
  | `docker-compose.yml` 의 그 외 설정 | 파일을 EC2로 `scp` 후 `docker compose up -d` |
  | DB 데이터 초기화 | `./deploy/redeploy-db.sh <서비스> --reset-data` |

  이미지가 낡았는지 의심되면 빌드 시각을 코드 수정 시각과 비교한다.
  `docker inspect -f '{{.Created}}' ems-web:arm64`

  증상 예: 프론트에 새로 추가한 라우트가 "no match" 로 뜨거나(번들에 그 코드가 없음),
  백엔드에 새로 추가한 `ApplicationRunner` 가 로그에 아무것도 남기지 않는다(jar에 클래스가 없음).
