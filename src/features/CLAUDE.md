# features 레이어

사용자 시나리오와 비즈니스 액션을 담당합니다.

---

## 책임 범위

- 사용자 입력 처리 (폼 상태, 유효성 검증)
- 비즈니스 액션 실행 (등록, 수정, 삭제, 선택)
- entity API를 호출하는 로직 오케스트레이션
- 도메인 이벤트 후 처리 (성공 콜백, 리다이렉트)

---

## 파일 구조 표준

```
feature-name/
├── index.ts
├── model/
│   ├── types.ts        # Form 타입 + getDefaultXxxForm()
│   └── mapper.ts       # Form → Entity DTO 변환
├── hooks/              # 폴더명 반드시 복수형
│   └── use-xxx.ts
└── ui/
    └── XxxForm.tsx
```

---

## 등록 폼 패턴

### Form 타입 (`model/types.ts`)

- Entity 도메인 타입과 **별개로** UI 상태를 포함한 Form 타입 정의
- UI 전용 필드 허용 (예: `isBizNumberChecked`, `workplaceName` 읽기 전용 표시)
- 초기값 생성 함수 `getDefaultXxxForm()` 함께 정의

```typescript
export type CompanyRegisterForm = {
  name: string;
  bizNumber: string;
  isBizNumberChecked: boolean;  // UI 전용 — DTO에는 없음
  // ...
};

export const getDefaultCompanyRegisterForm = (): CompanyRegisterForm => ({
  name: '',
  bizNumber: '',
  isBizNumberChecked: false,
  // ...
});
```

### Mapper (`model/mapper.ts`)

- Form → Entity DTO 변환 순수 함수
- `@shared/lib/formatters`의 유틸 활용:
  - `trimValue(s)` — 앞뒤 공백 제거
  - `stripFormatting(s)` — 포맷 문자 제거 (숫자만 추출)
- UI 전용 필드는 DTO에서 제외

```typescript
export function mapCompanyFormToDto(form: CompanyRegisterForm): CompanyRegisterRequest {
  return {
    name: trimValue(form.name),
    bizNumber: stripFormatting(form.bizNumber),
    tel: stripFormatting(form.tel),
    email: trimValue(form.email),
  };
}
```

### Feature Hook (`hooks/use-register-xxx.ts`)

```typescript
export function useRegisterCompany(onSuccess?: () => void) {
  const [form, setForm] = useState(getDefaultCompanyRegisterForm());
  
  const handleSubmit = async () => {
    const dto = mapCompanyFormToDto(form);
    await companyApi.registerCompany(dto);
    onSuccess?.();
  };
  
  return { form, setForm, handleSubmit };
}
```

---

## Select 훅 패턴

선택 상태와 관련 데이터 페칭을 함께 관리:

```typescript
export function useSelectCompany() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: companies } = useCompanies();
  
  return { selectedId, setSelectedId, companies };
}
```

---

## 알려진 위반 사항

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `sign-in/SignInForm.tsx` | `ui/` 없이 루트에 위치 | `ui/SignInForm.tsx`로 이동 |
| `sign-in/SocialSignIn.tsx` | `ui/` 없이 루트에 위치 | `ui/SocialSignIn.tsx`로 이동 |
| `select-company/hook/` | 폴더명 단수 | `hooks/`로 변경 |
| `contract-overview/use-contract-overview.ts` | `hooks/` 없이 루트에 위치 | `hooks/use-contract-overview.ts`로 이동 |
| `sign-in/SignInForm.tsx` | `@/components/ui/button` 직접 import | `@/shared/ui/buttons`를 통해 사용 |
| `register-company/ui/RegisterCompanyForm.tsx` | `@/components/ui/field`, `separator` 직접 import | `@/shared/ui/`를 통해 사용 |
