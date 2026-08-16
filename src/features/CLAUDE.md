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
│   ├── validator.ts    # 폼 유효성 검증 (필요 시)
│   └── hooks/
│       └── use-xxx.ts  # Feature Hook
└── ui/
    └── XxxForm.tsx
```

### 대형 폼 Feature (save-schedule-sheets 등)

섹션이 많은 폼은 표준 구조를 확장한다.

```
feature-name/
├── index.ts
├── model/
│   ├── types.ts
│   ├── mapper.ts
│   ├── validator.ts
│   ├── section-progress.ts   # 섹션별 입력 진행도 계산
│   ├── field-hints.ts        # 항목 도움말 문구 (shared/ui 의 HelpTip 이 소비)
│   └── hooks/
└── ui/
    ├── XxxEditor.tsx         # 섹션 조합 셸
    ├── sections/             # 섹션 단위 컴포넌트 + shell-props.ts
    └── report/               # 인쇄/미리보기 전용 뷰
```

> **훅은 `model/hooks/` 에 둔다.** 슬라이스 루트 `hooks/` 를 쓰는 슬라이스가
> `sign-in`·`sign-out`·`contract-overview` 3개 남아 있으나 규칙 위반이며 정리 대상이다.

---

## 등록 폼 패턴

### Form 타입 (`model/types.ts`)

- Entity 도메인 타입과 **별개로** UI 상태를 포함한 Form 타입 정의
- UI 전용 필드 허용 (예: `isBizNumberChecked`, `workplaceName` 읽기 전용 표시)
- 초기값 생성 함수 `getDefaultXxxForm()` 함께 정의

### Validator (`model/validator.ts`)

- 유효성 검증이 필요한 경우에만 생성한다.
- 순수 함수로만 구성한다 (부수효과 없음).
- 함수명은 `validateXxxFields` 형태를 사용한다.
- 반환 타입: `Partial<Record<keyof XxxForm, string>>` — 필드명 → 에러 메시지 맵
- 필수 필드 누락, 포맷 검증 등을 담당한다.
- `index.ts`에 export하지 않는다 (슬라이스 내부 유틸).

```ts
export const validateClientFields = (form: ClientRegisterForm) => {
  const errors: Partial<Record<keyof ClientRegisterForm, string>> = {};

  if (!form.name.trim()) {
    errors.name = "기관명을 입력해주세요.";
  }

  if (form.bizNumber && !/^\d{10}$/.test(form.bizNumber)) {
    errors.bizNumber = "10자리의 사업자번호를 입력해주세요.";
  }

  return errors;
};
```

---

### Mapper (`model/mapper.ts`)

- Form → Entity 도메인 입력 모델 변환 순수 함수
- 예: `ClientRegisterForm` → `ClientCreate`
- API Request DTO로 직접 변환하지 않는다.
- `@shared/lib`의 유틸 활용:
  - `trimValue(s)` — 앞뒤 공백 제거
  - `unformatNumber(s)` — 자릿수 코드 정규화 (숫자만 추출, 결과 `string`)
  - `toNumber(s)` / `toNumberOrNull(s)` — Form 문자열을 `number` / `number | null`로 변환
- UI 전용 필드는 변환 시 제외

### Feature Hook (`model/hooks/use-register-xxx.ts`)

- Form 상태를 관리한다.
- Form 유효성 검증을 수행한다.
- Form → Entity 도메인 입력 모델로 변환한다.
- Entity action hook을 호출한다.
- 성공 시 form reset, modal close, refetch, toast, navigate 등을 처리한다.
- API DTO를 직접 생성하지 않는다.

#### fieldErrors 패턴

필드별 에러 상태는 `Partial<Record<keyof XxxForm, string>>` 타입으로 관리한다.

```ts
const [fieldErrors, setFieldErrors] =
  useState<Partial<Record<keyof ClientRegisterForm, string>>>();
```

- **onChange 시 해당 필드 에러 즉시 클리어**: 사용자가 수정하는 순간 에러 메시지를 제거한다.

```ts
const handleChange = (name: keyof ClientRegisterForm, value: string) => {
  setForm((prev) => ({ ...prev, [name]: value }));
  setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
};
```

- **submit 시 검증 → 에러 있으면 조기 반환**: 검증 실패 시 API를 호출하지 않고 반드시 return한다.

```ts
// React 19 의 `React.SubmitEvent` 를 쓴다. `React.FormEvent` 는 @types/react 가
// 비권장으로 안내하는 타입이다.
const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();

  const errors = validateClientFields(form);
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    return; // ← 필수: 에러가 있으면 API 호출하지 않음
  }

  try { ... }
};
```

#### 예외 처리 패턴

API 호출 결과는 항상 try/catch로 감싸고, `toast`로 사용자에게 피드백을 준다.

```ts
try {
  await registerClient(toClientCreate(form));
  toast.success("측정대행 의뢰기관이 등록되었습니다.");
  setForm(getDefaultForm());
  onSuccess();
} catch (err) {
  const message = err instanceof Error ? err.message : "등록에 실패했습니다.";
  toast.error(message);
}
```

- 성공: `toast.success` → form reset → 성공 콜백
- 실패: `err instanceof Error ? err.message : '폴백 메시지'` 패턴으로 에러 메시지 추출 후 `toast.error`
- catch 블록에서 에러를 다시 throw하지 않는다 (Entity 액션 훅이 throw하면 여기서 최종 처리).

#### error 반환 정책

Feature 훅 내부에서 `toast.error`로 에러를 최종 처리한 경우, `error` state를 반환하지 않는다.
외부에서 에러를 별도로 표시할 UI가 없으면 dead return value가 된다.

```ts
// ❌ toast로 처리했는데 error도 반환
return { isLoading, error, handleDelete };

// ✅ toast로 최종 처리 → error 반환 불필요
return { isLoading, handleDelete };
```

단, 부모 컴포넌트가 에러 상태를 UI에 별도로 반영해야 하는 경우(예: 인라인 에러 메시지)에는 반환한다.

---

## Select 훅 패턴

선택 상태와 관련 데이터 페칭을 함께 관리한다.
entity의 **수동 호출 타입 fetch hook (타입 B)** 을 내부에서 사용한다.

### 배치 기준 — features vs pages/model

Select 훅은 재사용 가능성을 기준으로 레이어를 결정한다.

| 조건 | 배치 위치 |
|------|----------|
| 여러 페이지에서 재사용 | `features/select-xxx/model/hooks/` |
| 특정 페이지 전용 | `pages/<sub-domain>/model/` |

특정 페이지에서만 쓰이는 선택 로직을 features 슬라이스로 분리하는 것은 과설계다.
작성 시점에 재사용 계획이 없다면 pages/model에 두고, 실제 재사용 시점에 features로 승격한다.

> 현재 `select-*` feature 는 **0개**다. 선택 훅은 전부 `pages/*/model/use-*-selection.ts` 에 있다.

### 반환 인터페이스

| 반환값 | 설명 |
|--------|------|
| `selectedXxx` | 현재 선택된 항목 |
| `relatedData` | 선택에 연동되어 페칭된 하위 데이터 |
| `handleSelectXxxRow(item)` | 선택 핸들러, 연쇄 페칭 포함 |
| `clearXxxSelection()` | 선택 초기화 (필요 시) |
| `refetchRelated()` | 연동 데이터 재조회 |
| `loading`, `error` | 페칭 상태 |

---

## 알려진 위반 사항

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `sign-in/hooks/`, `sign-out/hooks/`, `contract-overview/hooks/` | 훅이 슬라이스 루트에 위치 | `model/hooks/` 로 이동 |
| `sign-in/hooks/use-sign-in.ts` | `signInApi` 직접 호출 (`entities/auth` 에 액션 훅이 없음) | entity 액션 훅 신설 후 경유 |
| `sign-in/model/mapper.ts` | Form → **Request DTO** 직접 변환 | 도메인 입력 모델을 거치도록 변경 |
| `dashboard-summary/model/use-dashboard.ts` | `dashboardApi` 직접 호출, 훅이 `model/` 직하 | `entities/dashboard` 에 `model/` 신설 후 경유 |
| `contract-overview/hooks/use-contract-overview.ts` | `workplaceApi` 직접 호출 | entity 페칭 훅 경유 |
