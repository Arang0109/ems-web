#!/usr/bin/env bash
# redeploy-frontend.sh / redeploy-backend.sh 공용 함수.
# 단독 실행용이 아니며 각 스크립트에서 source 한다.

# ── 임시 tar 저장 위치 ───────────────────────────────────────────────────
# /tmp 를 쓰면 안 된다. Git Bash가 /tmp 를 %LOCALAPPDATA%\Temp 로 변환해
# docker.exe(Windows 바이너리)에 넘기는데, 사용자명에 한글이 있으면 경로가 깨진다.
# 한글이 섞이지 않는 C:\Users\Public 아래를 쓴다.
TMP_DIR="${TMP_DIR:-/c/Users/Public/ems-deploy}"

BUILDER="emsbuilder"

step() { printf '\n\033[36m==> %s\033[0m\n' "$1"; }
info() { printf '%s\n' "$1"; }
ok()   { printf '\033[32m%s\033[0m\n' "$1"; }
warn() { printf '\033[33m경고: %s\033[0m\n' "$1" >&2; }
die()  { printf '\033[31m오류: %s\033[0m\n' "$1" >&2; exit 1; }

# 접속 정보 로드 — deploy.local.sh (미추적)에서 읽는다.
# EC2_HOST / SSH_USER / SSH_KEY / REMOTE_DIR / SERVER_REPO 를 채운다.
load_config() {
  local script_dir="$1"
  local cfg="$script_dir/deploy.local.sh"

  [ -f "$cfg" ] || die "접속 정보 파일이 없습니다: $cfg
  템플릿을 복사해 값을 채우세요:
    cp deploy/deploy.local.sh.example deploy/deploy.local.sh"

  step "접속 정보 로드: deploy.local.sh"
  # shellcheck source=/dev/null
  . "$cfg"

  SSH_USER="${SSH_USER:-ec2-user}"
  REMOTE_DIR="${REMOTE_DIR:-/home/ec2-user/ems}"

  [ -n "${EC2_HOST:-}" ] || die "EC2_HOST 가 비어 있습니다. (deploy.local.sh)"
  [ -n "${SSH_KEY:-}" ]  || die "SSH_KEY 가 비어 있습니다. (deploy.local.sh)"
  [ -f "$SSH_KEY" ]      || die "SSH 키를 찾을 수 없습니다: $SSH_KEY"

  TARGET="$SSH_USER@$EC2_HOST"
}

# buildx 빌더 확인/생성
ensure_builder() {
  step "buildx 빌더 확인/생성: $BUILDER"
  if docker buildx inspect "$BUILDER" >/dev/null 2>&1; then
    docker buildx use "$BUILDER" || die "buildx 빌더 선택 실패"
  else
    docker buildx create --name "$BUILDER" --use || die "buildx 빌더 생성 실패"
  fi
}

# arm64 이미지 빌드
#   $1 = 이미지 태그, $2 = 빌드 컨텍스트
build_arm64() {
  local tag="$1" context="$2"
  step "arm64 이미지 빌드 (linux/arm64): $tag"
  docker buildx build --platform linux/arm64 -t "$tag" --load "$context" \
    || die "이미지 빌드 실패"
}

# 이미지 저장 → scp 전송 → 원격 load → 해당 서비스만 재기동
#   $1 = 이미지 태그, $2 = tar 파일명, $3 = compose 서비스명
# gzip 없이 tar 로 보낸다(전송 시간보다 압축 CPU가 더 비싸고, 단계가 단순해진다).
ship_and_restart() {
  local tag="$1" tar_name="$2" service="$3"
  local local_tar="$TMP_DIR/$tar_name"
  local remote_tar="/tmp/$tar_name"

  mkdir -p "$TMP_DIR"

  step "이미지 저장: $local_tar"
  rm -f "$local_tar"
  docker save -o "$local_tar" "$tag" || die "docker save 실패"
  info "저장 완료: $(du -m "$local_tar" | cut -f1)MB"

  step "scp 전송 → $TARGET:$remote_tar"
  scp -i "$SSH_KEY" "$local_tar" "$TARGET:$remote_tar" || die "scp 전송 실패"

  step "원격 적용 (docker load + $service 재기동)"
  # 다른 컨테이너(DB 등)는 건드리지 않는다 — 서비스명을 명시해 해당 컨테이너만 재생성.
  ssh -i "$SSH_KEY" "$TARGET" "
    set -e
    docker load -i '$remote_tar'
    cd '$REMOTE_DIR'
    docker compose up -d --force-recreate '$service'
    docker image prune -f
    rm -f '$remote_tar'
    docker compose ps
  " || die "원격 적용 실패"

  rm -f "$local_tar"
}

# 원격 컨테이너 로그 출력
#   $1 = 서비스명, $2 = 기다릴 초, $3 = 줄 수
show_remote_logs() {
  local service="$1" wait_sec="$2" lines="$3"
  ssh -i "$SSH_KEY" "$TARGET" "
    sleep $wait_sec
    cd '$REMOTE_DIR'
    echo '--- $service 로그 (최근 ${lines}줄) ---'
    docker compose logs '$service' --tail $lines
  " || warn "로그 조회 실패(무시 가능)"
}

# HTTP 스모크 테스트 (폴링)
#   $1 = URL, $2 = 타임아웃(초), $3 = 재시도 간격(초)
# 502/504·연결실패는 아직 기동 중으로 보고 재시도한다.
# 그 외 응답(401·403·404 등)은 서버가 요청을 처리했다는 뜻이므로 성공으로 본다.
smoke_http() {
  local url="$1" timeout="$2" interval="$3"
  local deadline=$(( SECONDS + timeout ))
  local code

  printf '기동 대기 중 (최대 %s초)' "$timeout"
  while [ "$SECONDS" -lt "$deadline" ]; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null || echo 000)
    case "$code" in
      000|502|504) printf '.' ;;
      *) printf '\n'; ok "스모크 테스트: HTTP $code — 응답 확인"; return 0 ;;
    esac
    sleep "$interval"
  done

  printf '\n'
  warn "스모크 테스트 타임아웃(${timeout}초): $url"
  return 1
}
