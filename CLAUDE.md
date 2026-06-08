# ensolution-front-fsd

> ⚠️ 이 프로젝트는 `c:\dev\projects\new\ensolution-front-fsd` 입니다.
> `c:\dev\projects\ensolution-front` (기존 프로젝트)와 **다른 별개의 프로젝트**입니다.

---

## 프로젝트 정보

- **경로:** `c:\dev\projects\new\ensolution-front-fsd`
- **아키텍처:** Feature-Sliced Design (FSD)
- **스택:** React + TypeScript + Vite + TailwindCSS v4 + shadcn/ui + MSW
- **아키텍처 상세:** [ARCHITECTURE.md](./ARCHITECTURE.md) 참조

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

## 주요 명령어

```bash
npm run dev       # 개발 서버 (MSW 포함)
npm run build     # 빌드
npm run preview   # 빌드 미리보기
npx tsc --noEmit  # 타입 체크
```

---

## 네이밍 컨벤션

### 파일명

- React Component : `PascalCase`
  - `CompanyTable.tsx`
  - `RegisterCompanyForm.tsx`

- Hook : `kebab-case` + `use-`
  - `use-company.ts`
  - `use-register-company.ts`

- 일반 함수/유틸 : `kebab-case`
  - `mapper.ts`
  - `validator.ts`
  - `formatter.ts`

- API : `kebab-case`
  - `company-api.ts`
  - `contract-api.ts`

- Type : `types.ts`
- Constant : `constants.ts`

---

### 컴포넌트명

항상 `PascalCase`

```tsx
export const CompanyTable = () => {}
export const RegisterCompanyForm = () => {}
```

---

### Hook명

항상 `use`로 시작

```tsx
useCompany()
useCompanies()
useRegisterCompany()
```

- 단수 : 하나의 객체 관리
- 복수 : 목록 조회

예)

```
useCompany(id)
useCompanies()
```

---

### Mapper 함수

`toXxx` 형태를 사용

```
toCompanyRows()
toContractResponse()
toRegisterRequest()
```

반대 변환은

```
fromResponse()
fromDto()
```

또는

```
toDomain()
toEntity()
```

---

### API 함수

동사로 시작

```
getCompanies()
getCompany()

createCompany()

updateCompany()

deleteCompany()
```

조회는 `fetch`보다 `get`를 사용하여 통일한다.

---

### Boolean

`is`, `has`, `can`, `should` 접두어 사용

```
isLoading
isSelected
hasPermission
canEdit
shouldValidate
```

---

### Event Handler

`handle` 접두어 사용

```
handleSubmit()
handleChange()
handleClick()
handleSelect()
```

---

### Props

Component 이름을 반복하지 않는다.

```
interface Props {
  company: Company;
}

export const CompanyCard = ({ company }: Props) => {}
```

❌

```
interface CompanyCardProps {
  company: Company;
}
```

(파일명이 이미 `CompanyCard.tsx`이므로 `Props`만 사용)

---

### Public API

외부에서는 반드시 슬라이스의 `index.ts`를 통해 import한다.

```
✅
import { RegisterCompanyForm } from '@/features/register-company';

❌
import { RegisterCompanyForm } from '@/features/register-company/ui/RegisterCompanyForm';
```

---

## React 패턴 규칙

### prop → state 초기화 — `useEffect`로 동기화하지 말 것

외부 prop을 내부 state의 초기값으로 사용할 때 `useEffect` + `setState` 조합을 쓰지 말 것.
Effect 내부의 동기적 `setState`는 cascading render를 유발한다.

**금지 패턴**
```tsx
// ❌ useEffect로 prop을 state에 동기화
useEffect(() => {
  setForm({ name: company.name, ... });
}, [company]);
```

**권장 패턴 — `key`를 이용한 리마운트**
```tsx
// ✅ 부모에서 key를 변경하면 컴포넌트가 리마운트되어 초기값이 재적용됨
<DetailForm key={selectedItem?.id} item={selectedItem} />

// 자식 컴포넌트에서는 prop을 useState 초기값으로만 사용
const [form, setForm] = useState({
  name: item?.name ?? '',
});
```

`key`가 바뀌면 React는 컴포넌트를 언마운트 후 다시 마운트하므로 `useState` 초기값이 새로 적용된다.
이 방식은 "외부 데이터를 편집하는 폼"(상세 모달, 수정 다이얼로그 등) 패턴에 항상 적용한다.

단순히 props의 변경에 따라 내부 상태를 동기화해야 하는 경우에는 useEffect를 사용할 수 있다.
즉, key 기반 리마운트는 초기화(reset)가 목적일 때 사용하는 패턴이다.

---

## 레이어별 세부 규칙

각 레이어 디렉토리 하위 `CLAUDE.md`에 세부 지침이 있습니다.

| 레이어 | 세부 규칙 위치 |
|--------|--------------|
| app | [src/app/CLAUDE.md](./src/app/CLAUDE.md) |
| pages | [src/pages/CLAUDE.md](./src/pages/CLAUDE.md) |
| widgets | [src/widgets/CLAUDE.md](./src/widgets/CLAUDE.md) |
| features | [src/features/CLAUDE.md](./src/features/CLAUDE.md) |
| entities | [src/entities/CLAUDE.md](./src/entities/CLAUDE.md) |
| shared | [src/shared/CLAUDE.md](./src/shared/CLAUDE.md) |
