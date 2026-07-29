#!/usr/bin/env bash
#
# DB(mysql·redis·mongo) 컨테이너를 재배포한다.
#
#   프론트·백엔드와 달리 DB는 공식 이미지라 로컬 빌드·전송이 없다.
#   최신 docker-compose.yml 을 EC2로 scp → EC2에서 이미지 pull →
#   지정한 DB 컨테이너만 --force-recreate 로 재기동한다.
#   DB 재생성 후에는 backend 도 자동 재기동한다(재연결 이슈 차단 + .env 재반영).
#   frontend 컨테이너는 건드리지 않는다.
#
# 사용:
#   ./deploy/redeploy-db.sh                    # mysql·redis·mongo 전부 (데이터 보존)
#   ./deploy/redeploy-db.sh mysql              # 지정 서비스만
#   ./deploy/redeploy-db.sh mysql redis        # 복수 지정 가능
#   ./deploy/redeploy-db.sh mysql --reset-data # 데이터 초기화 포함 (확인 프롬프트)
#
# --reset-data 는 /data/<서비스> 볼륨을 비우는 파괴적 동작이다.
#   - 스키마는 ddl-auto: update 라 backend 재기동 시 자동 재생성된다.
#   - 운영자 계정 재생성은 EC2 .env 의 PLATFORM_BOOTSTRAP_ENABLED=true 가 필요하다
#     (deploy/README.md 의 "운영자 계정 최초 생성" 참고).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SCRIPT_DIR/_lib.sh"

ALL_SERVICES="mysql redis mongo"

SERVICES=""
RESET_DATA=0
for arg in "$@"; do
  case "$arg" in
    mysql|redis|mongo) SERVICES="$SERVICES $arg" ;;
    --reset-data) RESET_DATA=1 ;;
    *) die "알 수 없는 옵션: $arg (사용 가능: mysql redis mongo --reset-data)" ;;
  esac
done
SERVICES="${SERVICES# }"
[ -n "$SERVICES" ] || SERVICES="$ALL_SERVICES"

load_config "$SCRIPT_DIR"

info "대상  : $TARGET"
info "원격  : $REMOTE_DIR"
info "서비스: $SERVICES"
info "초기화: $([ "$RESET_DATA" -eq 1 ] && echo '예(--reset-data)' || echo '아니오(데이터 보존)')"

# ── 데이터 초기화 확인 ──────────────────────────────────────────────────
# 파괴적 동작이므로 삭제 대상을 보여주고 서비스명 목록을 그대로 타이핑해야 진행한다.
if [ "$RESET_DATA" -eq 1 ]; then
  step "데이터 초기화 확인"
  warn "다음 데이터 볼륨의 내용이 삭제됩니다:"
  for svc in $SERVICES; do
    info "  /data/$svc/*"
  done
  case " $SERVICES " in
    *" mysql "*)
      warn "MySQL 초기화 시 운영자 계정도 사라집니다."
      warn "재생성하려면 EC2 .env 의 PLATFORM_BOOTSTRAP_ENABLED=true 를 먼저 확인하세요."
      ;;
  esac
  printf '진행하려면 서비스 목록을 그대로 입력하세요 [%s]: ' "$SERVICES"
  read -r answer
  [ "$answer" = "$SERVICES" ] || die "입력이 일치하지 않아 중단합니다."
fi

# ── compose 파일 전송 ───────────────────────────────────────────────────
# compose 정의는 이 저장소가 소유한다 — 항상 최신본을 EC2에 반영하고 재생성한다.
step "docker-compose.yml 전송 → $TARGET:$REMOTE_DIR/"
scp -i "$SSH_KEY" "$SCRIPT_DIR/docker-compose.yml" "$TARGET:$REMOTE_DIR/" \
  || die "scp 전송 실패"

# ── 원격 적용 ───────────────────────────────────────────────────────────
step "원격 적용 (pull + 재기동: $SERVICES)"

RESET_CMDS=""
if [ "$RESET_DATA" -eq 1 ]; then
  # 삭제 전에 컨테이너를 내려 파일 잠금·쓰기 중 삭제를 피한다.
  # 디렉토리 자체는 지우지 않는다 — 바인드 마운트 포인트를 보존해야 한다.
  # glob(*) 대신 find -delete 를 쓴다 — 숨김 파일(dotfile)까지 확실히 지운다.
  RESET_CMDS="
    docker compose stop $SERVICES
    docker compose rm -f $SERVICES"
  for svc in $SERVICES; do
    RESET_CMDS="$RESET_CMDS
    sudo find /data/$svc -mindepth 1 -delete"
  done
fi

ssh -i "$SSH_KEY" "$TARGET" "
  set -e
  cd '$REMOTE_DIR'
  $RESET_CMDS
  docker compose pull $SERVICES
  docker compose up -d --force-recreate $SERVICES
  docker image prune -f
  docker compose ps
" || die "원격 적용 실패"

# ── DB 헬스체크 ─────────────────────────────────────────────────────────
# 초기화 직후 MySQL init 에 시간이 걸리므로 원격에서 폴링한다.
step "DB 헬스체크"
ssh -i "$SSH_KEY" "$TARGET" "
  set -e
  cd '$REMOTE_DIR'
  check() {
    local name=\"\$1\"; shift
    local deadline=\$(( SECONDS + 120 ))
    printf '%s 대기 중' \"\$name\"
    while [ \"\$SECONDS\" -lt \"\$deadline\" ]; do
      if \"\$@\" >/dev/null 2>&1; then printf ' OK\n'; return 0; fi
      printf '.'
      sleep 3
    done
    printf ' 실패\n'
    return 1
  }
  for svc in $SERVICES; do
    case \"\$svc\" in
      mysql) check mysql docker compose exec -T mysql mysqladmin ping --silent ;;
      redis) check redis docker compose exec -T redis redis-cli ping ;;
      mongo) check mongo docker compose exec -T mongo mongosh --quiet --eval 'db.runCommand({ping:1}).ok' ;;
    esac
  done
" || die "DB 헬스체크 실패 — docker compose logs 를 확인하세요."

# ── backend 재기동 ──────────────────────────────────────────────────────
# restart 가 아닌 up --force-recreate 를 쓴다 — .env 를 다시 읽어야
# 데이터 초기화 후 부트스트랩(PLATFORM_BOOTSTRAP_ENABLED) 값이 반영된다.
step "backend 재기동"
ssh -i "$SSH_KEY" "$TARGET" "
  set -e
  cd '$REMOTE_DIR'
  docker compose up -d --force-recreate backend
  docker compose ps
" || die "backend 재기동 실패"

# 스모크 테스트는 redeploy-backend.sh 와 동일 패턴 — frontend nginx 의 /api 프록시 경유,
# 502/504 는 기동 중으로 재시도, 그 외 응답(401·403·404 등)은 성공으로 본다.
step "스모크 테스트"
smoke_http "http://$EC2_HOST/api/health" 120 5 || warn "backend 로그를 확인하세요."

# 부트스트랩(ApplicationRunner)은 기동 맨 마지막에 돌므로 스모크 테스트 뒤에 찍는다.
step "backend 기동 로그"
show_remote_logs "backend" 3 40

ok ""
ok "✅ DB 재배포 완료 ($SERVICES) → backend 재기동됨"
