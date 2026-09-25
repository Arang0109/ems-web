import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 빌드·동기화 산출물은 검사 대상이 아니다. 넣어 두면 전체 경고의 절반 이상이 이쪽에서 나와
  // 정작 소스의 문제가 묻힌다. ds-bundle 은 .gitignore 대상이고 .design-sync 는 생성물이다.
  globalIgnores(['dist', 'ds-bundle', '.design-sync', 'public/mockServiceWorker.js']),
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
  // ─── FSD 레이어 경계 ─────────────────────────────────────────────────────────
  // 아래 레이어는 위 레이어를 import 할 수 없다(app → pages → widgets → features → entities → shared).
  // 같은 레이어의 다른 슬라이스도 금지다 — 필요하면 한 단 아래로 내린다.
  // 관례로만 지켜지던 규칙이라(2026-09 기준 위반 0건) 새 코드가 깨지 않도록 린트로 고정한다.
  // 비즈니스 코드는 shadcn 원본(`@/components/ui`)·`@shared/ui/primitives` 를 직접 쓰지 않는다 — shared/ui 래퍼를 쓴다.
  ...[
    { layer: 'shared', banned: ['@entities', '@features', '@widgets', '@pages', '@app'] },
    { layer: 'entities', banned: ['@entities', '@features', '@widgets', '@pages', '@app'] },
    { layer: 'features', banned: ['@features', '@widgets', '@pages', '@app'] },
    { layer: 'widgets', banned: ['@widgets', '@pages', '@app'] },
    { layer: 'pages', banned: ['@pages', '@app'] },
  ].map(({ layer, banned }) => ({
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: banned.map((alias) => `${alias}/*`),
            message: `${layer} 레이어는 같은 레이어의 다른 슬라이스나 상위 레이어를 import 할 수 없다 (FSD). 슬라이스 안에서는 상대 경로를 쓴다.`,
          },
          ...(layer === 'shared'
            ? []
            : [{
                group: ['@/components/ui/*', '@shared/ui/primitives', '@shared/ui/primitives/*'],
                message: 'shadcn 원본·primitives 는 shared/ui 래퍼 안에서만 쓴다. @shared/ui/* 의 래퍼를 쓸 것.',
              }]),
        ],
      }],
    },
  })),
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
