#!/usr/bin/env bash
#
# 백엔드(ems-server) 수정 후 backend 컨테이너만 재빌드·전송·재기동한다.
#
#   로컬(Git Bash)에서 arm64 이미지를 빌드 → docker save → scp 전송 →
#   EC2에서 docker load 후 backend 컨테이너만 --force-recreate 로 재기동한다.
#   DB(mysql·redis·mongo)·프론트 컨테이너는 건드리지 않는다.
#
#   빌드 컨텍스트는 WSL 안의 백엔드 저장소(SERVER_REPO)이며 Windows Docker Desktop이
#   UNC 경로로 읽는다. 따라서 WSL(Ubuntu-22.04)이 실행 중이어야 한다.
#
# 사용:
#   ./deploy/redeploy-backend.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SCRIPT_DIR/_lib.sh"

IMAGE_TAG="ems-server:arm64"
TAR_NAME="ems-server-arm64.tar"
SERVICE="backend"

for arg in "$@"; do
  die "알 수 없는 옵션: $arg (이 스크립트는 옵션을 받지 않습니다)"
done

load_config "$SCRIPT_DIR"

# SERVER_REPO 는 백엔드 배포에만 필요하므로 load_config 가 아닌 여기서 검증한다.
# WSL이 꺼져 있으면 UNC 경로가 통째로 사라져 buildx가 모호한 에러를 내므로 미리 잡는다.
[ -n "${SERVER_REPO:-}" ] || die "SERVER_REPO 가 비어 있습니다. (deploy.local.sh)"
[ -d "$SERVER_REPO" ] || die "백엔드 저장소를 찾을 수 없습니다: $SERVER_REPO
  WSL(Ubuntu-22.04)이 실행 중인지 확인하세요."

info "대상  : $TARGET"
info "원격  : $REMOTE_DIR"
info "이미지: $IMAGE_TAG"
info "소스  : $SERVER_REPO"

# 타입체크 단계가 없다 — Docker 안에서 gradle bootJar 가 돌며 컴파일까지 검증한다.
ensure_builder
info ""
info "Gradle 의존성 해석 + bootJar 빌드까지 수 분 걸립니다."
build_arm64 "$IMAGE_TAG" "$SERVER_REPO"
ship_and_restart "$IMAGE_TAG" "$TAR_NAME" "$SERVICE"

# backend 는 외부 포트가 없으므로(내부 :8080) frontend nginx 의 /api 프록시를 경유한다.
# Spring 기동에 30~60초가 걸려 프론트(30초)보다 길게 폴링한다.
# 502·504 는 기동 중으로 보고 재시도하며, 그 외 응답(401·403·404 등)은 백엔드가 요청을
# 처리했다는 뜻이므로 성공으로 본다 — 엔드포인트가 실제로 존재할 필요는 없다.
step "스모크 테스트"
smoke_http "http://$EC2_HOST/api/health" 120 5 || warn "backend 로그를 확인하세요."

# 로그는 스모크 테스트 뒤에 찍는다 — ApplicationRunner(부트스트랩)는 기동 맨 마지막에 돌아서
# 기동을 기다리지 않고 찍으면 정작 필요한 [bootstrap] 로그가 아직 없다.
step "backend 기동 로그"
show_remote_logs "$SERVICE" 3 40

ok ""
ok "✅ 백엔드 재배포 완료 → http://$EC2_HOST/api/"
