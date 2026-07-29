# Architecture — ems-web

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
│       ├── tabs/
│       └── toasts/
├── components/   # shadcn/ui CLI 자동 생성 경로 (FSD 예외 허용)
└── lib/          # shadcn/ui 유틸 (cn 함수 등) (FSD 예외 허용)
```

> `src/components/`와 `src/lib/`는 shadcn/ui CLI가 자동 생성하는 표준 경로로, FSD 규칙 예외를 허용합니다.

---

## 핵심 FSD 규칙

### Import 방향 (엄격 적용)

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- **같은 레이어 간 직접 import 금지** (shared 제외)
- `@/components/ui/*`는 shadcn/ui 원본 컴포넌트(`src/components/`)에서만 직접 참조 허용
- 비즈니스 로직 코드(features, widgets 등)에서는 `@shared/ui/*`를 통해 사용

### Public API

- 각 슬라이스는 `index.ts`를 Public API로 사용
- 슬라이스 외부에서는 `index.ts`를 통해서만 import하며, 내부 구현 경로에는 의존하지 말 것

---

## 현재 구현된 슬라이스

| 레이어 | 슬라이스 |
|--------|---------|
| pages | `sign-in`, `dashboard`, `client`(하위 `client`, `contract`, `pollutant`) |
| widgets | `sign-in`, `layouts`, `metrics`, `contract-chart`, `client-table`, `workplace-table`, `stack-table`, `contract-table`, `pollutant-table`, `stack-list-table`, `stack-profile` |
| features | `sign-in`, `sign-out`, `contract-overview`, `dashboard-summary`, `register-client`, `register-workplace`, `register-stack`, `register-contract`, `register-pollutant`, `register-facility`, `register-prevention`, `register-stack-pollutant`, `update-client`, `update-contract`, `update-workplace`, `update-stack`, `update-facility`, `update-prevention` |
| entities | `auth`, `client`, `workplace`, `stack`, `contract`, `dashboard`, `pollutant`, `stack-pollutant` |
| shared | `api`, `hooks`, `icon`, `lib`, `model`, `ui` |

---

## 슬라이스 표준 내부 구조

```
slice-name/
├── index.ts       # Public API (필수 — 외부 노출은 여기서만)
├── ui/            # UI 컴포넌트 (컴포넌트 파일은 반드시 ui/ 안에)
├── model/         # 비즈니스 도메인 타입, state, hook, types
├── api/           # API 호출 함수 + DTO
├── lib/           # 순수 유틸리티 (mapper, formatter, validator 등)
├── config/        # 슬라이스 전용 설정값 (constants, routes 등)
└── assets/        # 슬라이스 전용 리소스
```

레이어마다 필요한 서브디렉토리만 포함합니다 (모두 필수는 아님).

---

## 레이어별 책임 요약

| 레이어 | 책임 |
|--------|------|
| app | 앱 초기화, provider 등록, 전역 설정, 라우트 구성 |
| pages | 라우트 단위 화면 — widget/feature/entity를 조합 |
| widgets | 여러 entity/feature를 조합하는 복합 UI 블록 |
| features | 사용자 시나리오 — 폼 상태, 제출 로직, 선택/액션 처리 |
| entities | 도메인 모델 — 타입, 표시용 UI, 도메인 API, 데이터 조회 훅 |
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
  → features/*/model (폼 상태, 검증, 제출 로직)
  → features/*/model/mapper 또는 features/*/lib/mapper (Form → Request DTO 변환)
  → entities/*/api (API 호출)
```

### 데이터 수정/삭제 (폼 제출)

```
features/*/ui (수정/삭제 폼 입력)
  → features/*/model (폼 상태, 제출·삭제 로직)
  → features/*/model/mapper (Form → UpdateDTO 변환)
  → entities/*/model (useXxxAction 훅 — isLoading/error 관리)
  → entities/*/api (도메인 API 호출)
```

### 상수/레이블 사용

```
shared/model/types/common-types (공통 enum/type)
  → shared/config/labels (공통 레이블맵)
  → features/*/model (폼 선택지 생성)
  → widgets/*/model/mapper (표시 라벨 변환)
```

---

## 알려진 FSD 위반 사항 (개선 필요)

레이어별 세부 위반 목록은 각 레이어 `CLAUDE.md`의 "알려진 위반 사항" 절을 참조한다.
대표적인 미해소 항목은 다음과 같다.

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `features/sign-in/ui/SignInForm.tsx`, `SocialSignIn.tsx` | `@/components/ui/button` 직접 import | `@shared/ui/buttons`를 통해 사용 |
| `features/register-client/ui/RegisterClientForm.tsx`, `register-pollutant/ui/RegisterPollutantForm.tsx` | `@/components/ui/field` 직접 import | `@shared/ui/`에 FieldGroup 래퍼 추가 후 교체 |
| `features/register-stack-pollutant/ui/RegisterStackPollutantForm.tsx` | 자체 훅과 불일치하는 미완성 폼(다른 폼에서 복사된 잔재) | 훅(`rows` 기반 다중행 입력)에 맞게 재작성 |