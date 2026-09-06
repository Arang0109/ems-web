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
    │   └── sampling-point/   # 한 파일로 감당 안 되는 섹션은 디렉토리로 편다 (아래 참조)
    ├── calc/                 # 계산 결과 표면 — 섹션을 가로지르는 파생값 (아래 참조)
    └── report/               # 인쇄/미리보기 전용 뷰
```

### 입력과 계산 결과는 표면으로 가른다

섹션 폼에는 **현장에서 적어 넣는 값**만 둔다. 계산 결과가 섹션마다 흩어지면
"수분량이 이만큼인데 표준유량이 이게 맞나" 같은 대조를 섹션을 오가며 해야 한다.

경계선은 `shared/ui` 가 이미 그어 놓은 두 컴포넌트를 그대로 쓴다.

| 무엇 | 어디 |
|------|------|
| 입력에 딸린 파생값 **한 줄** (`CalcResultRow`) — 대기압 아래 mmHg 환산 등 | 그 입력 옆에 남는다 |
| 입력 셀과 나란한 파생 **셀** (`TableResultCell`) — 전치 표의 `평균` 열 | 표에 남는다 |
| 독립된 결과 **묶음** (`CalcResultGrid`) — 평균·자동계산·산정 예상치 | `ui/calc/` 의 드로어로 모은다 |

같은 값이라도 **어떤 표현으로 놓였는지**가 기준이다. 측정지점 평균이 그 예다 —
데스크탑 전치 표의 `평균` 열은 지점 값 옆에서 대조하는 자리라 남고, 모바일 카드 아래 붙던
`측정지점 평균` 아코디언은 입력에서 떨어진 결과 묶음이라 드로어로 갔다.
두 표현이 어긋나지 않도록 평균 판정은 `averageOf` 한 곳에서만 나온다.

```
ui/calc/
├── SheetCalcDrawer.tsx   # 계산값 드로어 — 액션 바의 [계산값] 이 입구
├── calc-groups.tsx       # previewCalc → CalcResultGrid 항목 묶음 빌더
└── index.ts
```

- **고르는 컨트롤이 계산 결과에서 나오는 값이면 컨트롤도 드로어로 간다** — 노즐 사이즈
  Select 가 그 경우다. 근거(추천 목록·예상치)와 떨어져 있으면 대조가 안 된다.
  그래서 추천 후보를 눌러도 드로어를 닫지 않는다.
- **읽기만 하는 묶음과 고르는 도구는 탭으로 가른다.** 세로로 쌓으면 고른 뒤 결과를 보려고
  스크롤을 오가게 된다. 첫 탭은 **입구 버튼의 이름과 같은 것**으로 둔다(`계산값`) —
  도구가 없는 카테고리(가스상)에서 탭 없이 그릴 때도 처음 보이는 화면이 같아진다.
- **열림 상태는 액션 바를 가진 `XxxEditor` 가, 표면은 `XxxFormView` 가 소유한다.**
  입구와 표면이 다른 컴포넌트에 있을 때는 상태만 위로 올린다 — 표면을 위로 올리면
  섹션이 들고 있던 판정(배출가스 입력칸 노출 등)을 위에서 다시 계산해야 해 소스가 갈린다.
- **드로어와 섹션이 같은 값을 그리면 스펙을 공유한다.** 배출가스 성분은
  `sections/exhaust-gas-rows.tsx` 가 입력 회차 행과 평균 묶음을 함께 낸다.

**섹션 하나가 200 줄을 넘거나 같은 데이터를 두 표현으로 그리면 디렉토리로 편다.**
`sections/sampling-point/` 가 그 형태다 — 모바일 카드와 데스크탑 전치 표가 같은 항목을
다르게 그리므로, 표현을 나누되 **스펙과 파생값은 한 소스로 묶는다.**

```
sections/sampling-point/
├── index.ts                  # 섹션 컴포넌트만 노출
├── SamplingPointSection.tsx  # 셸 — 요약 헤더 + 세 조각 조합
├── PointCommonValues.tsx     # 지점과 무관한 시트 단위 입력 (입자상 전용)
├── PointCards.tsx            # 모바일 표현 (지점 = 카드) — 지점별 값만
├── PointTable.tsx            # 데스크탑 표현 (행=항목, 열=지점 + 평균 열)
├── point-fields.tsx          # 항목 스펙 — 라벨·단위·하한·증감폭
└── point-results.tsx         # 파생값 — 평균 판정·결과 행 빌더 (계산값 드로어도 소비)
```

- **두 표현은 스펙 배열(`point-fields`)을 공유한다.** 각자 필드를 나열하면 한쪽만 고쳐져 어긋난다.
- **항목별 차이는 스펙에서만 선언한다.** 값의 하한(`min`)처럼 항목마다 갈리는 속성은
  **선택 속성으로 두지 말 것** — 아무도 판단하지 않은 채 기본값이 먹는다.
  실제로 동압(ΔP)에 음수 부호(±) 버튼이 붙어 있었다. `min: number | undefined` 처럼
  **키를 필수로** 두면 새 항목을 추가할 때 컴파일러가 판단을 강제한다.

### 스텝 위저드 폼 Feature (register-equipment 등)

폼이 길어 모달 안에서 단계로 나누는 경우. `@shared/ui/dialogs` 의 `StepFormDialog` 를 쓴다.

```
feature-name/
├── model/
│   ├── types.ts
│   ├── step-progress.ts      # 노출 스텝 목록(조건부 포함) + 스텝별 진행도
│   ├── validator.ts          # validateXxxStep 스텝별 + STEP_VALIDATORS + 합집합
│   └── hooks/
└── ui/
    ├── XxxForm.tsx           # StepFormDialog 에 스텝을 조합하는 셸
    └── steps/                # 스텝 컴포넌트 + step-props.ts (공유 그리드 상수)
```

- **조건부 스텝은 `getVisibleXxxSteps(...)` 가 배열에서 빼서** 표현한다 (`hidden` 플래그 금지).
- 진행도 배지의 분모는 **검증 규칙에서 파생**시킨다. 임의로 "입력 칸 수"를 세면
  제출 가능한데도 미완성으로 읽히고, 배지와 검증이 어긋난다.
- 훅은 `validateStep(id)`(스텝 단위 검증)과 `isDirty` 를 추가로 반환한다.
  `Select`·`DatePicker`·`Checkbox` 는 `input` 이벤트를 내지 않아 모달의 기본 판정이 놓친다.

> **훅은 `model/hooks/` 에 둔다.** 슬라이스 루트 `hooks/` 를 쓰는 슬라이스가
> `sign-in`·`sign-out` 2개 남아 있으나 규칙 위반이며 정리 대상이다.

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
- 스텝 위저드 폼에서는 스텝별로 쪼개고 `STEP_VALIDATORS` 로 묶는다. 이때
  **`validateXxxFields` 는 스텝 검증 함수들의 합집합이어야 한다** — 마지막 스텝에서
  제출할 때 앞 스텝의 누락을 놓치지 않기 위함이다. 회귀 테스트로 강제한다
  (`register-equipment/model/validator.test.ts` 참조).
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

- **스텝 위저드는 두 시점에 검증한다**: `다음` 클릭 시 **현재 스텝만**(`validateStep(id)`),
  제출 시 **전체**를 검증하고 첫 실패 스텝으로 이동한다.

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
| `sign-in/hooks/`, `sign-out/hooks/` | 훅이 슬라이스 루트에 위치 | `model/hooks/` 로 이동 |
| `sign-in/hooks/use-sign-in.ts` | `signInApi` 직접 호출 (`entities/auth` 에 액션 훅이 없음) | entity 액션 훅 신설 후 경유 |
| `sign-in/model/mapper.ts` | Form → **Request DTO** 직접 변환 | 도메인 입력 모델을 거치도록 변경 |
| `dashboard-summary/model/use-dashboard.ts` | `dashboardApi` 직접 호출, 훅이 `model/` 직하 | `entities/dashboard` 에 `model/` 신설 후 경유 |
