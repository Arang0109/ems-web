# ensolution-front-fsd

> ⚠️ 이 프로젝트는 `c:\dev\projects\ensolution-front-fsd` 입니다.
> `c:\dev\projects\ensolution-front` (기존 프로젝트)와 **다른 별개의 프로젝트**입니다.

---

## 프로젝트 정보

- **경로:** `c:\dev\projects\ensolution-front-fsd`
- **아키텍처:** Feature-Sliced Design (FSD)
- **스택:** React + TypeScript + Vite + TailwindCSS v4 + MSW

---

## FSD 레이어 구조

```
src/
├── app/          # 앱 진입점, providers, routes, global styles
├── pages/        # 페이지 컴포넌트 (라우트 단위)
├── widgets/      # 독립적인 UI 블록 (여러 entities/features 조합)
├── features/     # 사용자 시나리오, 비즈니스 액션
├── entities/     # 비즈니스 엔티티 (auth, dashboard 등)
└── shared/       # 재사용 가능한 공통 모듈
    ├── api/      # axios 인스턴스, MSW 핸들러
    ├── model/    # 공통 타입
    └── ui/       # 공통 UI 컴포넌트
```

### 현재 구현된 슬라이스

| 레이어 | 슬라이스 |
|--------|---------|
| pages | `sign-in`, `dashboard` |
| widgets | `sign-in`, `layouts`, `dashboard` |
| features | `sign-in`, `sign-out`, `get-dashboard-summary` |
| entities | `auth`, `dashboard` |
| shared | `api`, `model`, `ui` |

---

## 개발 규칙

### FSD Import 규칙 (엄격 적용)
- 상위 레이어는 하위 레이어만 import 가능
- 같은 레이어 간 직접 import 금지 (shared 제외)
- 순서: `app` → `pages` → `widgets` → `features` → `entities` → `shared`

### 슬라이스 내 Public API
- 각 슬라이스는 반드시 `index.ts`를 통해서만 외부에 노출
- 내부 구현 파일을 직접 import하지 말 것

### 파일 구조 (슬라이스 내부)
```
feature-name/
├── index.ts          # Public API (필수)
├── ui/               # UI 컴포넌트
├── hooks/            # 커스텀 훅
├── api/              # API 호출
└── model/            # 타입, 스토어
```

---

## 주요 명령어

```bash
npm run dev       # 개발 서버 (MSW 포함)
npm run build     # 빌드
npm run preview   # 빌드 미리보기
npx tsc --noEmit  # 타입 체크
```

---

## 환경 설정

- **CSS:** TailwindCSS v4 (`postcss.config.js` 기반, `tailwind.config.js` 없음)
- **Mock API:** MSW (개발 환경에서 자동 활성화)
- **Path Alias:** `@/` → `src/`
