# ems-web

환경측정 관리 시스템(EMS) 프론트엔드.

React 19 + TypeScript + Vite 기반이며, Feature-Sliced Design(FSD) 아키텍처를 따릅니다.
백엔드는 별도 저장소인 `ems-server`(Java 21 / Spring Boot)입니다.

---

## 시작하기

```bash
npm install
npm run dev        # http://localhost:5173
```

개발 서버는 `/api` 요청을 `http://localhost:8080` 으로 프록시합니다.
백엔드를 띄우지 않아도 MSW 목 API 로 개발할 수 있습니다.

### 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (MSW 포함) |
| `npm run build` | 프로덕션 빌드 (`tsc -b && vite build`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint |
| `npm run test` | 단위 테스트 (vitest) |
| `npm run test:watch` | 단위 테스트 watch |
| `npx tsc -b` | 타입 체크 |

> 타입 체크는 반드시 `npx tsc -b` 를 씁니다. `tsc --noEmit` 은 이 프로젝트의
> solution-style `tsconfig.json` 구조상 검사 대상이 0개라 **항상 통과합니다.**

---

## 환경 변수

| 변수 | `.env.development` | `.env.production` | 설명 |
|------|--------------------|-------------------|------|
| `VITE_API_URL` | `http://localhost:8080/api` | `/api` | API 베이스 URL |
| `VITE_ENABLE_MSW` | `true` | `false` | MSW 목 API 활성화 |

---

## 디렉토리 구조

```
src/
├── app/        앱 진입점, provider, 라우트 + 가드
├── pages/      라우트 단위 화면
├── widgets/    복합 UI 블록 (테이블·프로파일 등)
├── features/   사용자 시나리오 (폼, 액션)
├── entities/   도메인 타입 + API + 데이터 훅
├── shared/     비즈니스 무관 공통 모듈
├── components/ shadcn/ui CLI 생성 경로 (FSD 예외)
└── lib/        shadcn/ui 유틸 (FSD 예외)
```

레이어는 `app → pages → widgets → features → entities → shared` 단방향으로만 의존합니다.
슬라이스 외부에서는 반드시 `index.ts`(Public API)를 통해 import 합니다.

---

## 배포

`Dockerfile` 로 빌드해 nginx(`docker/nginx.conf`)로 서빙합니다.
배포 절차는 [deploy/README.md](./deploy/README.md) 를 참조하세요.

---

## 문서

| 문서 | 내용 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 개발 규칙 — 네이밍, React 패턴, 숫자 타입 처리 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | FSD 레이어 구조, 슬라이스 목록, 데이터 흐름 |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | 디자인 토큰, 컴포넌트 현황, shadcn 제거 진행 상황 |
| `src/*/CLAUDE.md` | 레이어별 세부 규칙 |
