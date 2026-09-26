import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 설치(홈 화면) + 앱 셸 precache. 데이터(/api)는 캐시하지 않는다 — 항상 네트워크.
    // 등록은 src/app/providers/pwa-update-prompt.tsx 가 프로덕션 빌드에서만 한다.
    VitePWA({
      registerType: 'prompt',
      // 개발 모드는 MSW 서비스워커가 같은 scope(/)를 쓴다 — 둘이 겹치지 않게 끈다.
      devOptions: { enabled: false },
      // public 의 아이콘은 아래 globPatterns 가 이미 담는다 — 매니페스트 아이콘을 따로 넣으면 중복 항목이 된다.
      includeManifestIcons: false,
      manifest: {
        name: 'EcoMetric',
        short_name: 'EcoMetric',
        description: '측정대행업무 관리 시스템',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#f7f8f8',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // woff2 는 precache 에서 뺀다 — Pretendard dynamic-subset 은 파일이 수십 개라 설치가 무거워진다.
        // 실제로 쓰인 서브셋만 아래 runtimeCaching 이 담는다.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // pwa-icon.svg 는 PNG 아이콘을 만드는 원본이라 앱이 쓰지 않는다.
        globIgnores: ['mockServiceWorker.js', 'pwa-icon.svg'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/ws/, /^\/mockServiceWorker\.js$/],
        cleanupOutdatedCaches: true,
        // 기본 상한(2MiB)을 넘는 파일은 경고만 남기고 precache 에서 조용히 빠진다.
        // 메인 번들이 이미 1.8MB 라 코드 분할 전까지는 여유를 둔다.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/') && url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 채팅 STOMP. ws: true 가 없으면 업그레이드가 프록시를 통과하지 못한다.
      // .env.development 는 절대 URL(ws://localhost:8080/ws)을 쓰므로 이 프록시를 타지 않지만,
      // 상대 경로(/ws)로 붙이고 싶을 때를 위해 둔다 — 배포와 같은 형태로 개발할 수 있다.
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
