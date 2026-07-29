# ---- build stage: Vite 프로덕션 번들 생성 ----
FROM node:22-alpine AS build
WORKDIR /app

# 의존성 레이어 캐시 최적화 (lock 파일만 먼저 복사)
# npm ci 대신 npm install 사용: lockfile이 Windows에서 생성되어
# linux/arm64 네이티브 optional 의존성(@emnapi 등)이 빠져 있으면 npm ci가 실패한다.
# npm install은 대상 플랫폼(arm64)에 맞게 의존성을 재조정한다.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# 소스 복사 후 빌드 (tsc -b && vite build → dist/, .env.production 자동 적용)
COPY . .
RUN npm run build

# ---- runtime stage: nginx 정적 서빙 + /api 리버스 프록시 ----
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
