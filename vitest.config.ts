import { defineConfig } from 'vitest/config'
import path from 'path'

// 순수 계산 로직 단위테스트 전용 설정. UI 플러그인 없이 node 환경에서 실행한다.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
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
})
