import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui CLI 가 생성하는 경로(ARCHITECTURE.md 의 FSD 예외).
    // 컴포넌트와 훅(useSidebar 등)을 한 파일에서 함께 내보내는 것이 shadcn 의 원본 구조라
    // HMR 편의 규칙을 적용할 수 없다. 파일을 고치면 CLI 재생성 시 되돌아간다.
    // 이 디렉토리는 DESIGN-SYSTEM.md 의 "shadcn 제거 4단계"에서 통째로 사라진다.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
