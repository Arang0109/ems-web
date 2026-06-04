# Architecture — ensolution-front-fsd

Feature-Sliced Design (FSD) 아키텍처 문서입니다.

---

## 레이어 구조

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
│   ├── lib/      # 유틸리티 (formatters 등)
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
├── components/   # shadcn/ui CLI 자동 생성 경로 (FSD 예외 허용)
└── lib/          # shadcn/ui 유틸 (cn 함수 등) (FSD 예외 허용)
```

> `src/components/`와 `src/lib/`는 shadcn/ui CLI가 자동 생성하는 표준 경로로, FSD 규칙 예외를 허용합니다.

---

## Import 방향

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- 같은 레이어 간 직접 import 금지 (shared 제외)
- `@/components/ui/*`는 shadcn/ui 원본 컴포넌트(`src/components/`)에서만 직접 참조 허용
- 비즈니스 로직 코드(features, widgets 등)에서는 `@/shared/ui/*`를 통해 사용

---

## 현재 구현된 슬라이스

| 레이어 | 슬라이스 |
|--------|---------|
| pages | `sign-in`, `dashboard`, `client` |
| widgets | `sign-in`, `layouts`, `company-table`, `workplace-table`, `stack-table`, `contract-table`, `metrics`, `contract-chart` |
| features | `sign-in`, `sign-out`, `register-company`, `register-workplace`, `register-stack`, `register-contract`, `select-company`, `select-workplace`, `dashboard-summary`, `contract-overview` |
| entities | `auth`, `company`, `workplace`, `stack`, `contract`, `dashboard` |
| shared | `api`, `hooks`, `icon`, `lib`, `model`, `ui` |

---

## 슬라이스 표준 내부 구조

```
slice-name/
├── index.ts       # Public API (필수 — 외부 노출은 여기서만)
├── ui/            # UI 컴포넌트 (컴포넌트 파일은 반드시 ui/ 안에)
├── hooks/         # 커스텀 훅 (복수형)
├── api/           # API 호출 함수 + DTO
└── model/         # 비즈니스 도메인 타입, 상태
```

레이어마다 필요한 서브디렉토리만 포함합니다 (모두 필수는 아님).

---

## 레이어별 책임 요약

| 레이어 | 책임 |
|--------|------|
| app | 앱 초기화, provider 등록, 라우트 정의 |
| pages | 라우트 단위 컴포넌트 — widget 조합만 |
| widgets | 여러 entity/feature를 조합하는 복합 UI 블록 |
| features | 사용자 시나리오 — 폼 상태, 제출 로직, 선택 상태 |
| entities | 순수 도메인 타입 + API 호출 + 데이터 페칭 훅 |
| shared | 비즈니스 무관 재사용 유틸, UI 기본 요소 |

---

## 데이터 흐름 패턴

### 데이터 조회 (테이블 표시)

```
shared/api (axios)
  → entities/*/api (도메인 API 호출)
  → entities/*/model (useXxx 훅 — 데이터 페칭)
  → widgets/*/model/mapper (Entity → TableRow 변환)
  → widgets/*/ui (테이블 렌더링)
```

### 데이터 등록 (폼 제출)

```
features/*/ui (폼 입력)
  → features/*/hooks (폼 상태 관리)
  → features/*/model/mapper (Form → DTO 변환)
  → entities/*/api (API 호출)
```

### 상수/레이블 사용

```
shared/model/common-types (상수 + 타입 + 레이블맵)
  → features/*/model/types (폼 선택지 생성)
  → widgets/*/model/mapper (표시 라벨 변환)
```

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
