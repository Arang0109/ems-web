# ensolution-front-fsd

> ⚠️ 이 프로젝트는 `c:\dev\projects\new\ensolution-front-fsd` 입니다.
> `c:\dev\projects\ensolution-front` (기존 프로젝트)와 **다른 별개의 프로젝트**입니다.

---

## 프로젝트 정보

- **경로:** `c:\dev\projects\new\ensolution-front-fsd`
- **아키텍처:** Feature-Sliced Design (FSD)
- **스택:** React + TypeScript + Vite + TailwindCSS v4 + shadcn/ui + MSW

---

## FSD 레이어 구조

```
src/
├── app/          # 앱 진입점, providers, routes
├── pages/        # 페이지 컴포넌트 (라우트 단위)
├── widgets/      # 독립적인 복합 UI 블록
├── features/     # 사용자 시나리오, 비즈니스 액션
├── entities/     # 비즈니스 엔티티 (도메인 타입 + API + 상태)
├── shared/       # 재사용 가능한 공통 모듈
│   ├── api/      # axios 인스턴스, MSW 핸들러
│   ├── hooks/    # 공통 훅
│   ├── icon/     # 공통 아이콘
│   ├── model/    # 공통 타입, 상수
│   └── ui/       # 공통 UI 컴포넌트
│       ├── badges/
│       ├── borders/
│       ├── buttons/
│       ├── cards/
│       ├── dialogs/
│       ├── form/
│       ├── links/
│       ├── pagination/
│       ├── semantics/
│       ├── table/
│       └── table-ui/
├── components/   # shadcn/ui CLI 자동 생성 경로 (예외 허용)
└── lib/          # shadcn/ui 유틸 (cn 함수 등) (예외 허용)
```

> `src/components/`와 `src/lib/`는 shadcn/ui CLI가 자동 생성하는 표준 경로로, FSD 규칙 예외를 허용합니다.

---

## 현재 구현된 슬라이스

| 레이어 | 슬라이스 |
|--------|---------|
| pages | `sign-in`, `dashboard`, `client` |
| widgets | `sign-in`, `layouts`, `company-table`, `workplace-table`, `metrics`, `contract-chart` |
| features | `sign-in`, `sign-out`, `register-company`, `register-workplace`, `select-company`, `dashboard-summary`, `contract-overview` |
| entities | `auth`, `company`, `dashboard`, `workplace` |
| shared | `api`, `hooks`, `icon`, `model`, `ui` |

---

## 개발 규칙

### FSD Import 방향 (엄격 적용)

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- **같은 레이어 간 직접 import 금지** (shared 제외)
- `@/components/ui/*`는 shadcn/ui 원본 컴포넌트에서만 직접 참조 허용
- 비즈니스 로직 코드(features, widgets 등)에서는 `@/shared/ui/*`를 통해 사용

### 슬라이스 내 Public API

- 각 슬라이스는 반드시 `index.ts`를 통해서만 외부에 노출
- 내부 구현 파일(`ui/`, `hooks/`, `api/`, `model/`)을 직접 import하지 말 것

### 슬라이스 내부 파일 구조 (표준)

```
slice-name/
├── index.ts       # Public API (필수)
├── ui/            # UI 컴포넌트 (컴포넌트 파일은 반드시 ui/ 안에)
├── hooks/         # 커스텀 훅 (복수형, hooks/)
├── api/           # API 호출 + DTO + mapper
└── model/         # 비즈니스 도메인 타입, 상태
```

### Entity 레이어 책임 범위

- `entity/model/` — 순수 비즈니스 도메인 타입만 (`Company`, `Workplace` 등)
- Form 데이터 타입(`CompanyRegisterForm` 등)은 해당 feature의 `model/`에 위치
- API 변환 mapper는 `entity/api/` 안에 위치 (`model/`이 아님)
- UI 표현용 타입(`WorkplaceTableCols` 등)은 widget의 `model/`에 위치

### Widget 레이어 책임 범위

- 여러 entity/feature를 조합하는 복합 UI 블록
- TanStack Table 상태, 필터, 페이지네이션 관리는 widget 내부에서 허용
- 폼 상태는 feature 훅에서 관리하고 widget은 prop으로 전달받는 것을 권장

---

## 알려진 FSD 위반 사항 (개선 필요)

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `features/sign-in/SignInForm.tsx` | `ui/` 서브디렉토리 없이 루트에 위치 | `ui/SignInForm.tsx`로 이동 |
| `features/sign-in/SocialSignIn.tsx` | `ui/` 서브디렉토리 없이 루트에 위치 | `ui/SocialSignIn.tsx`로 이동 |
| `features/select-company/hook/` | 폴더명 단수 | `hooks/`로 변경 |
| `features/contract-overview/use-contract-overview.ts` | `hooks/` 없이 루트에 위치 | `hooks/use-contract-overview.ts`로 이동 |
| `entities/company/model/company-form.ts` | Form 타입이 entity에 혼재 | `features/register-company/model/`로 이동 |
| `entities/company/model/company-mapper.ts` | mapper가 `model/`에 위치 | `api/company-mapper.ts`로 이동 |
| `entities/company/model/company-types.ts` | `WorkplaceTableCols` (UI 표현 타입) 포함 | `widgets/company-table/model/`로 분리 |
| `features/sign-in/SignInForm.tsx` | `@/components/ui/button` 직접 import | `@/shared/ui/buttons`를 통해 사용 |
| `features/register-company/ui/RegisterCompanyForm.tsx` | `@/components/ui/field`, `separator` 직접 import | `@/shared/ui/`를 통해 사용 |

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
- **Path Aliases:**
  - `@/` → `src/`
  - `@shared/` → `src/shared/`
  - `@entities/` → `src/entities/`
  - `@features/` → `src/features/`

---

## 주요 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| 라우팅 | React Router v7 |
| 테이블 | TanStack React Table |
| 차트 | Recharts |
| UI 컴포넌트 | shadcn/ui + Radix UI |
| HTTP | Axios (axiosPublic / axiosPrivate) |
| Mock API | MSW |
| 아이콘 | Lucide React |
