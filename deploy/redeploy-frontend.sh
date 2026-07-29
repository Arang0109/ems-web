#!/usr/bin/env bash
#
# 프론트(ems-web) 수정 후 frontend 컨테이너만 재빌드·전송·재기동한다.
#
#   로컬(Git Bash)에서 arm64 이미지를 빌드 → docker save → scp 전송 →
#   EC2에서 docker load 후 frontend 컨테이너만 --force-recreate 로 재기동한다.
#   DB·백엔드 컨테이너는 건드리지 않는다.
#
# 사용:
#   ./deploy/redeploy-frontend.sh                 # 타입체크 후 재배포
#   ./deploy/redeploy-frontend.sh --skip-typecheck  # 빌드의 tsc -b 를 믿고 생략
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
. "$SCRIPT_DIR/_lib.sh"

IMAGE_TAG="ems-web:arm64"
TAR_NAME="ems-web-arm64.tar"
SERVICE="frontend"

SKIP_TYPECHECK=0
for arg in "$@"; do
  case "$arg" in
    --skip-typecheck) SKIP_TYPECHECK=1 ;;
    *) die "알 수 없는 옵션: $arg (사용 가능: --skip-typecheck)" ;;
  esac
done

load_config "$SCRIPT_DIR"

info "대상  : $TARGET"
info "원격  : $REMOTE_DIR"
info "이미지: $IMAGE_TAG"

cd "$REPO_ROOT"

if [ "$SKIP_TYPECHECK" -eq 0 ]; then
  # tsc -b 를 쓴다. tsc --noEmit 은 검사하는 파일이 0개라 항상 통과한다 —
  # 루트 tsconfig.json 이 files:[] + references 구조인데 references 는 빌드 모드(-b)에서만
  # 따라가기 때문이다. 이미지 빌드의 `tsc -b && vite build` 와 동일한 검사여야 의미가 있다.
  step "타입체크 (tsc -b)"
  npx tsc -b || die "타입체크 실패"
else
  step "타입체크 생략(--skip-typecheck)"
fi

ensure_builder
build_arm64 "$IMAGE_TAG" "$REPO_ROOT"
ship_and_restart "$IMAGE_TAG" "$TAR_NAME" "$SERVICE"

# nginx는 즉시 뜨므로 짧게만 확인한다.
step "스모크 테스트"
smoke_http "http://$EC2_HOST/" 30 3 || warn "SG/HTTPS 설정을 확인하세요."

ok ""
ok "✅ 프론트 재배포 완료 → http://$EC2_HOST/"
