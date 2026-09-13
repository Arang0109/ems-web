# ems-web

> ⚠️ 이 프로젝트는 `c:\dev\projects\new\ems-web` 입니다.
> `c:\dev\projects\ensolution-front` (기존 프로젝트)와 **다른 별개의 프로젝트**입니다.

---

## 프로젝트 정보

- **경로:** `c:\dev\projects\new\ems-web`
- **아키텍처:** Feature-Sliced Design (FSD)
- **스택:** React 19 + TypeScript + Vite + TailwindCSS v4 + Base UI(shadcn/ui 기반) + MSW
- **아키텍처 상세:** [ARCHITECTURE.md](./ARCHITECTURE.md) 참조
- **디자인 시스템:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) 참조
  (컬러·타이포·간격·코너 토큰, 컴포넌트 현황, shadcn 제거 진행 상황)
- **배포:** `Dockerfile` + `docker/nginx.conf` + [deploy/README.md](./deploy/README.md)

### 주요 의존성

| 영역 | 라이브러리 |
|------|-----------|
| 라우팅 | `react-router` / `react-router-dom` 7 |
| 서버 상태 | `@tanstack/react-query` 5 (+ `@tanstack/react-query-devtools`) |
| 테이블 | `@tanstack/react-table` 8 |
| 차트 | `recharts` 3 (+ `@recharts/devtools`) |
| UI 동작 레이어 | `@base-ui/react` (shadcn/ui 컴포넌트의 기반) |
| 드래그앤드롭 | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (`shared/ui/sortable` 에서만 직접 쓴다) |
| 토스트 | `sonner` |
| 테마 | `next-themes` |
| 날짜 | `date-fns`, `react-day-picker` |
| 아이콘 | `lucide-react`, `@hugeicons/*` |
| 폰트 | `pretendard` |
| 주소 검색 | `@clroot/react-kakao-postcode` |
| HTTP | `axios` |
| 실시간 | `@stomp/stompjs` (채팅 STOMP 수신 전용. `sockjs-client` 는 쓰지 않는다 — 서버가 폴백을 켜지 않는다) |
| 테스트 | `vitest` |

> **서버 상태는 react-query 가, 클라이언트 상태는 직접 관리한다.**
>
> 서버에서 온 데이터(목록·상세·CRUD)는 `@tanstack/react-query` 가 소유한다 —
> 캐시·중복 요청 합치기·무효화를 손으로 짜지 않는다. 자세한 규약은
> [src/entities/CLAUDE.md](./src/entities/CLAUDE.md) 의 "훅 패턴" 참조.
>
> 그 밖에는 여전히 라이브러리를 쓰지 않는다 — **redux/zustand/react-hook-form/zod 를 도입하지 않는다.**
> 클라이언트 전역 상태는 `entities/auth` 의 Context 하나뿐이고, 폼은 `useState` + 슬라이스별
> `model/validator.ts` 로 처리한다. 새 라이브러리 도입은 별도 합의 사항이다.

---

## 백엔드 서버 참조

프론트의 API·DTO·타입은 백엔드 서버 `ems-server`의 실제 계약에 맞춰 작업한다.
API 관련 작업(entity의 api/dto/mapper, 신규 feature 등) 전에 **먼저 서버 코드를 확인**한다.

- **서버 경로:** `\\wsl.localhost\Ubuntu-22.04\home\kmsq321\dev_wsl\projects\ems-server`
- **접근 방법 (WSL):**
  - Bash 도구 : UNC 경로 `//wsl.localhost/Ubuntu-22.04/home/kmsq321/dev_wsl/projects/ems-server` 사용
    (`/home/...` 직접 접근은 마운트 위치가 달라 실패함)
  - Read / Grep / Glob 도구 : `\\wsl.localhost\Ubuntu-22.04\home\kmsq321\dev_wsl\projects\ems-server\...`
- **스택:** Java 21 + Spring Boot 3.5.14, Spring Security/JWT, JPA/MySQL, Redis, MapStruct
- **아키텍처:** 헥사고날(Ports & Adapters) + DDD, 기능 모듈 단위(`auth`, `tenant`, `contract`, `report`, `global`)
- **API 규칙:** `/api/...` REST 엔드포인트, 모든 응답은 `ApiResponse<T>`로 래핑, 대부분 JWT Bearer 인증 필요
- **참조 문서 (서버 저장소 내):**
  - `CLAUDE.md` — 서버 개발 규칙
  - `ARCHITECTURE.md` — 아키텍처 상세
  - `docs/DATABASE.md` — DB 스키마
  - `docs/chat-websocket-protocol.md` — **채팅 REST·STOMP 계약** (프론트용으로 작성돼 있다)
  - Swagger UI `/swagger-ui.html`, OpenAPI JSON `/v3/api-docs` (서버 실행 시, 기본 8080)
- **컨트롤러/DTO 위치:** `src/main/java/com/ensolution/ems/{모듈}/presentation/.../controller`
  (요청/응답 DTO는 같은 모듈의 `request/`·`response/`)

---

## 환경 설정

- **CSS:** TailwindCSS v4 — `vite.config.ts` 의 `@tailwindcss/vite` 플러그인으로 연결한다.
  `tailwind.config.js` 는 없고, 토큰은 `src/app/index.css` 의 `@theme inline` 에 정의한다.
  (`postcss.config.js` 는 `export default {}` 인 빈 파일이다 — Tailwind 설정이 여기 있지 않다.)
- **TypeScript:** `tsconfig.app.json` 에 `"strict": true`. 새 코드도 strict 를 통과해야 한다.
- **API 프록시:** 개발 서버에서 `/api` → `http://localhost:8080` (`vite.config.ts`)
- **Mock API:** MSW. `VITE_ENABLE_MSW` 환경변수로 켠다
  (`.env.development` = `true`, `.env.production` = `false`).
  도메인별 on/off 는 `src/shared/api/mocks/handlers/index.ts` 의 상태 마커로 관리한다.
- **Path Aliases** (`vite.config.ts` · `tsconfig.app.json` · `vitest.config.ts` 3곳에 동일하게 정의):

  | alias | 대상 |
  |-------|------|
  | `@/` | `src/` |
  | `@app/` | `src/app/` |
  | `@pages/` | `src/pages/` |
  | `@widgets/` | `src/widgets/` |
  | `@features/` | `src/features/` |
  | `@entities/` | `src/entities/` |
  | `@shared/` | `src/shared/` |

  > FSD 레이어는 **레이어 alias(`@entities/` 등)를 쓴다.** `@/entities/` 형태는 쓰지 않는다.
  > `@/` 는 FSD 밖의 shadcn 잔재(`@/components/ui/*`, `@/lib/utils`) 전용이다.

---

## 주요 명령어

```bash
npm run dev        # 개발 서버 (MSW 포함)
npm run build      # 빌드 (tsc -b && vite build)
npm run preview    # 빌드 미리보기
npm run lint       # ESLint
npm run test       # 단위 테스트 (vitest run)
npm run test:watch # 단위 테스트 watch
npx tsc -b         # 타입 체크 (--noEmit 은 쓰지 말 것 — 아래 참고)
```

> ⚠️ **타입 체크는 `npx tsc -b` 를 쓴다. `npx tsc --noEmit` 은 검사하는 파일이 0개라 항상 통과한다.**
> 루트 `tsconfig.json` 이 `files: []` + `references` 구조(solution-style)인데, `references` 는
> 빌드 모드(`-b`)에서만 따라가기 때문이다. `npm run build` 의 `tsc -b && vite build` 와
> 동일한 검사여야 실제 빌드 실패를 미리 잡을 수 있다.

### 테스트 정책

`vitest.config.ts` 는 node 환경으로 `src/**/*.test.ts` 만 대상으로 한다 (DOM 없음).
따라서 **테스트 대상은 순수 함수**다 — `shared/lib` 의 포맷/변환 헬퍼, `entities/*/lib/` 의
도메인 계산 로직, feature 의 `validator.ts` / `mapper.ts`.
컴포넌트·훅 테스트는 현재 대상이 아니다 (`@testing-library/react` 미설치).

---

## 네이밍 컨벤션

### 파일명

- React Component : `PascalCase`
  - `ClientTable.tsx`
  - `RegisterClientForm.tsx`

- Hook : `kebab-case` + `use-`
  - `use-client.ts`
  - `use-register-client.ts`

- 일반 함수/유틸 : `kebab-case`
  - `mapper.ts`
  - `validator.ts`
  - `formatter.ts`

- API : `kebab-case`
  - `client-api.ts`
  - `contract-api.ts`

- Type : `types.ts`
- Constant : `constants.ts`

---

### 컴포넌트명

항상 `PascalCase`

```tsx
export const ClientTable = () => {}
export const RegisterClientForm = () => {}
```

---

### Hook명

항상 `use`로 시작

```tsx
useClient()
useClients()
useRegisterClient()
```

- 단수 : 하나의 객체 관리
- 복수 : 목록 조회

예)

```
useClient(id)
useClients()
```

---

### Mapper 함수

`toXxx` 형태를 사용

```
toClientRows()
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
getClients()
getClient()

createClient()

updateClient()

deleteClient()
```

조회는 `fetch`보다 `get`를 사용하여 통일한다.

> 이 규칙은 `entities/*/api/api.ts` 의 **API 함수**에만 적용한다.
> 훅이 노출하는 명령형 트리거(수동 조회 훅의 반환 함수)는 값을 반환하지 않고 상태를
> 갱신하므로 `fetchXxx` 를 쓴다. 예: `const { data, fetchStacks } = useStacks()`

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
  client: Client;
}

export const ClientCard = ({ client }: Props) => {}
```

❌

```
interface ClientCardProps {
  client: Client;
}
```

(파일명이 이미 `ClientCard.tsx`이므로 `Props`만 사용)

---

### Public API

외부에서는 반드시 슬라이스의 `index.ts`를 통해 import한다.

```
✅
import { RegisterClientForm } from '@/features/register-client';

❌
import { RegisterClientForm } from '@/features/register-client/ui/RegisterClientForm';
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
  setForm({ name: client.name, ... });
}, [client]);
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

## 숫자 타입 처리 규칙

숫자 값이 레이어를 통과할 때의 타입 규칙. 서버 계약(BigDecimal·Long·Double·int)은 JSON에서 number다.

### 핵심 원칙

> **`string`은 UI 입력의 표현일 뿐이며 Form 레이어에만 존재한다.**
> **Domain 입력 모델부터 안쪽(Domain → DTO → wire)은 숫자는 `number`다.**
> **string → number 변환은 단 한 곳, Form→Domain 경계(feature mapper)에서 일어난다.**

### 레이어별 타입

| 레이어 | 파일 | 숫자량(금액·율·수량) | 식별자(ID) | 자릿수 문자열(사업자번호·전화·우편·SEMS) |
|--------|------|----------------------|------------|------------------------------------------|
| **Form** | `features/*/model/types.ts` | `string` (기본값 `""`) | `string` (Select 값) | `string` |
| **Form→Domain** | `features/*/model/mapper.ts` | **여기서 변환** | `Number(form.id)` | `unformatNumber` (문자열 유지) |
| **Domain 입력** | `entities/*/model/types.ts` | `number` (선택필드는 `number \| null`) | `number` | `string` |
| **Domain→DTO** | `entities/*/api/mapper.ts` | passthrough | passthrough | passthrough |
| **Request DTO** | `entities/*/api/dto.ts` | `number` (`number \| null`) | `number` | `string` |
| **표시(Row)** | `widgets/*/model/mapper.ts` | `number` → `formatNumber()` 등 → `string` | — | — |

### 규칙 상세

1. **Form 숫자 필드는 항상 `string`** — 텍스트 입력의 동작(빈 문자열, 포맷팅)과 일치. 기본값은 `""`.
   순수 정수 필드(율·기간 등)도 예외 없이 `string`으로 둔다.
2. **변환은 feature mapper에서** — Domain 입력 모델은 의미적으로 `number`. entity mapper(`Domain→DTO`)는
   숫자를 절대 재변환하지 않고 passthrough한다.
3. **식별자(ID)** — Domain·DTO 모두 `number`. Select 값은 문자열이므로 feature mapper에서 `Number(form.xxxId)`.
4. **자릿수 문자열(코드)** — 사업자번호·전화번호·우편번호·SEMS번호 등은 "숫자 값"이 아니라 코드이므로
   전 레이어 `string`. `unformatNumber`로 숫자 외 문자만 제거(정규화)한다.
5. **nullable 숫자** — 서버가 nullable(BigDecimal·Double 등)인 필드는 Domain·DTO 모두 `number | null`.
   빈 입력은 `0`이 아니라 `null`로 보내 "미지정"과 "0"을 구분한다.

### 변환 헬퍼 (`@shared/lib`)

| 헬퍼 | 방향 | 용도 | 빈값 처리 |
|------|------|------|-----------|
| `toNumber(s)` | Form → Domain | **필수** 숫자 필드 파싱 (콤마·공백 제거, 소수·음수 허용) | `0` |
| `toNumberOrNull(s)` | Form → Domain | **선택(nullable)** 숫자 필드 파싱 | `null` |
| `toFormValue(n)` | Domain → Form | `toNumber`/`toNumberOrNull` 의 **역방향**. 수정 폼 초기값 채우기 | `''` |
| `unformatNumber(s)` | 양방향 | 자릿수 문자열(코드) 정규화 — 결과는 `string` | `''` |

> 수정 폼에서 서버 값을 되돌릴 때 `String(value)` 를 쓰지 말 것 —
> `null` 이 `"null"` 문자열이 되어 입력창에 그대로 노출된다. `toFormValue` 를 쓴다.

```ts
// features/*/model/mapper.ts — Form(string) → Domain(number)
export const toContractCreate = (form: ContractRegisterForm): ContractCreate => ({
  workplaceId: Number(form.workplaceId),          // ID: string(Select) → number
  contractAmount: toNumber(form.contractAmount),  // 필수 숫자
  delayPenaltyRate: toNumber(form.delayPenaltyRate),
  bizNumber: unformatNumber(form.bizNumber),      // 코드: string 유지
  ...
});

// entities/*/api/mapper.ts — Domain(number) → DTO(number): passthrough
export const toRegisterRequest = (vo: ContractCreate): ContractRegisterRequest => ({
  workplaceId: vo.workplaceId,      // 재변환 금지
  contractAmount: vo.contractAmount,
  ...
});
```

> **읽기(응답) 경로는 별개다.** 서버 응답 필드가 문자열이면(예: `allowance`는 서버 응답이 `String`)
> 응답 DTO는 그 계약(`string`)을 그대로 따르고, 표시 단계(widget mapper)에서 포맷한다.
> 위 규칙은 쓰기(Form→Domain→요청 DTO) 경로에 적용한다.

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
