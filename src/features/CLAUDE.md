# features 레이어

사용자 시나리오와 비즈니스 액션을 담당합니다.

---

## 책임 범위

- 사용자 입력 처리 (폼 상태, 유효성 검증)
- 비즈니스 액션 실행 (등록, 수정, 삭제, 선택)
- entity가 외부로 공개한 hook 또는 action을 사용해 비즈니스 액션을 실행
- 도메인 이벤트 후 처리 (성공 콜백, 리다이렉트)

---

## 금기 사항

- `entities/*/api/dto.ts` 직접 import 금지
- `entities/*/api/api.ts` 직접 import 금지
- Feature Form 타입을 entity로 이동 금지
- TableRow, SelectOption 같은 UI 표현 타입 정의 금지

---

## 파일 구조 표준

### 등록/수정 Feature (register-xxx, update-xxx)

```
feature-name/
├── index.ts
├── model/
│   ├── types.ts        # Form 타입 + getDefaultXxxForm()
│   ├── mapper.ts       # Form → Entity 변환
│   └── hooks/
│       └── use-xxx.ts  # Feature Hook
└── ui/
    └── XxxForm.tsx
```

### Select Feature (select-xxx)

```
feature-name/
├── index.ts
└── hooks/              # feature 루트 바로 아래, 폴더명 반드시 복수형
    └── useXxxSelection.ts
```

---

## 등록 폼 패턴

### Form 타입 (`model/types.ts`)

- Entity 도메인 타입과 **별개로** UI 상태를 포함한 Form 타입 정의
- UI 전용 필드 허용 (예: `isBizNumberChecked`, `workplaceName` 읽기 전용 표시)
- 초기값 생성 함수 `getDefaultXxxForm()` 함께 정의

### Mapper (`model/mapper.ts`)

- Form → Entity 도메인 입력 모델 변환 순수 함수
- 예: `CompanyRegisterForm` → `CompanyCreate`
- API Request DTO로 직접 변환하지 않는다.
- `@shared/lib/formatters`의 유틸 활용:
  - `trimValue(s)` — 앞뒤 공백 제거
  - `stripFormatting(s)` — 포맷 문자 제거 (숫자만 추출)
- UI 전용 필드는 변환 시 제외

### Feature Hook (`model/hooks/use-register-xxx.ts`)

- Form 상태를 관리한다.
- Form 유효성 검증을 수행한다.
- Form → Entity 도메인 입력 모델로 변환한다.
- Entity action hook을 호출한다.
- 성공 시 form reset, modal close, refetch, toast, navigate 등을 처리한다.
- API DTO를 직접 생성하지 않는다.

---

## Select 훅 패턴

선택 상태와 관련 데이터 페칭을 함께 관리한다.
entity의 **수동 호출 타입 fetch hook (타입 B)** 을 내부에서 사용한다.

### `useCompanySelection` (`select-company/hooks/useCompanySelection.ts`)

| 반환값 | 설명 |
|--------|------|
| `selectedCompany` | 현재 선택된 회사 (`Company \| null`) |
| `workplaces` | 선택된 회사의 사업장 목록 |
| `handleSelectCompanyRow(company)` | 회사 선택 시 호출, workplaces 자동 페칭 |
| `refetchWorkplaces()` | 현재 선택된 회사의 workplaces 재조회 |
| `loading`, `error` | 페칭 상태 |

### `useWorkplaceSelection` (`select-workplace/hooks/useWorkplaceSelection.ts`)

| 반환값 | 설명 |
|--------|------|
| `selectedWorkplace` | 현재 선택된 사업장 (`Workplace \| null`) |
| `stacks` | 선택된 사업장의 굴뚝 목록 |
| `handleSelectWorkplaceRow(workplace)` | 사업장 선택 시 호출, stacks 자동 페칭 |
| `clearWorkplaceSelection()` | 선택 초기화 |
| `refetchStacks()` | 현재 선택된 사업장의 stacks 재조회 |
| `loading`, `error` | 페칭 상태 |

---

## 알려진 위반 사항

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `sign-in/SignInForm.tsx` | `ui/` 없이 루트에 위치 | `ui/SignInForm.tsx`로 이동 |
| `sign-in/SocialSignIn.tsx` | `ui/` 없이 루트에 위치 | `ui/SocialSignIn.tsx`로 이동 |
| `contract-overview/use-contract-overview.ts` | `hooks/` 없이 루트에 위치 | `hooks/use-contract-overview.ts`로 이동 |
| `sign-in/SignInForm.tsx` | `@/components/ui/button` 직접 import | `@/shared/ui/buttons`를 통해 사용 |
| `register-company/ui/RegisterCompanyForm.tsx` | `@/components/ui/field`, `separator` 직접 import | `@/shared/ui/`를 통해 사용 |
