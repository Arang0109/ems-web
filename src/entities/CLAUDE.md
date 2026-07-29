# entities 레이어

비즈니스 도메인 타입, API 호출, 데이터 페칭/액션 훅을 담당합니다.

---

## 책임 범위

- 순수 도메인 타입 정의 (`Client`, `Workplace` 등)
- API 호출 함수 정의 (CRUD)
- 서버 응답/요청 DTO 정의
- 데이터 페칭 훅 (`useCompanies`, `useWorkplaces` 등)
- CRUD 액션 훅 (`useRegisterClientAction`, `useUpdateClientAction` 등)

## 금지 사항

- **Form 타입 금지** — `ClientRegisterForm` 등은 해당 feature의 `model/`에 위치
- **UI 표현 타입 금지** — `ClientTableRow` 등은 해당 widget의 `model/`에 위치
- **mapper 함수 `model/`에 위치 금지** — mapper는 `api/`에 위치

## 외부 노출 원칙

- Entity slice에서 외부 레이어로 노출할 수 있는 타입은 `model/types.ts`의 **도메인 모델 타입**만 허용한다.
- 여기에는 조회 모델뿐 아니라 등록/수정에 사용하는 도메인 입력 모델도 포함된다.

```ts
// ✅ 허용
export type { Client } from './model/types';

// ❌ 금지
export type { ClientCreateRequest } from './api/dto';
```

---

## 파일 구조 표준

```
entity-name/
├── index.ts
├── api/
│   ├── api.ts        # API 호출 함수 (object 패턴)
│   ├── dto.ts        # 요청/응답 DTO 타입
│   └── mapper.ts     # Domain ↔ DTO 변환
└── model/
    ├── types.ts                    # 순수 도메인 타입만
    ├── use-xxxs.ts                 # 데이터 페칭 훅
    ├── use-register-xxx-action.ts  # 등록 액션 훅
    ├── use-update-xxx-action.ts    # 수정 액션 훅 (필요시)
    └── use-delete-xxx-action.ts    # 삭제 액션 훅 (필요시)
```

---

## 의존 방향

- `api/api.ts`는 `api/dto.ts`만 참조한다.
- `api/api.ts`는 `model/types.ts`를 참조하지 않는다.
- `api/mapper.ts`는 `api/dto.ts`와 `model/types.ts`를 모두 참조할 수 있다.
- `model/use-xxxs.ts`는 `api/api.ts`, `api/mapper.ts`, `model/types.ts`를 참조할 수 있다.
- `model/use-xxx-action.ts`는 `api/api.ts`, `api/mapper.ts`, `model/types.ts`를 참조할 수 있다.
- pages, features, widgets은 entities layer `index.ts`를 통해 노출된 도메인 타입과 hook만 사용한다.

---

## API 패턴

### `api/api.ts` — Object 패턴

`api/dto.ts`의 요청/응답 DTO만 사용한다.

### `api/dto.ts` — 요청/응답 DTO 분리

응답 wrapper: `ApiResponseMessage<T>` (`@shared/model/api-types` 참조)

### `model/types.ts` — 순수 도메인 타입

프론트 내부에서 사용할 순수 도메인 타입을 정의한다.

### `api/mapper.ts` — DTO ↔ Domain 변환

Domain 입력 모델 → 요청 DTO, 응답 DTO → Domain 변환 순수 함수를 정의한다.

---

## 훅 패턴

### 데이터 페칭 훅 — 타입 A: 자동 로드

마운트 시 자동으로 API를 호출하고, `refetch()`로 재조회를 트리거한다.
`revision` state를 증가시켜 `useEffect`를 재실행하는 패턴을 사용한다.

적용 entity: `client` (`useClients`, `useClientDetail`), `contract` (`useContracts`), `workplace` (`useWorkplaceDetail`), `pollutant` (`usePollutants`)

```ts
return { data, loading, error, refetch };
```

### 데이터 페칭 훅 — 타입 B: 수동 호출

마운트 시 자동 호출하지 않고, 외부에서 `fetchXxx(id)`를 명시적으로 호출해야 데이터를 로드한다.
부모 컴포넌트의 선택 이벤트에 의해 트리거되는 종속 데이터에 사용한다.

적용 entity: `workplace` (`useWorkplaces`), `stack` (`useStacks`, `useStackDetail`), `contract` (`useContractDetail`), `stack-pollutant` (`useStackPollutants`)

```ts
return { data, loading, error, fetchWorkplaces };
```

### 액션 훅 — CRUD 작업

도메인 입력 모델을 받아 `api/mapper.ts`로 DTO 변환 후 API를 호출한다.
`isLoading`, `error` 상태를 직접 관리한다.

```ts
return { registerClient, isLoading, error };
```

✅ 허용
- API 호출
- 로딩 상태 관리
- 에러 상태 관리
- DTO ↔ Domain 변환
- 도메인 데이터 반환

❌ 금지
- Entity Layer의 Hook에서 UI 후처리 로직을 직접 수행하지 않는다.
- Entity Layer는 도메인 기능만 알아야 하며 UI 상태 변경, 화면 이동, 모달 제어, 토스트 출력 등은 Feature Layer의 사용자 시나리오 책임

---

## Entity별 노출 훅 목록

| Entity | 페칭 훅 | 액션 훅 |
|--------|---------|---------|
| `client` | `useClients` (자동), `useClientDetail` (자동) | `useRegisterClientAction`, `useUpdateClientAction`, `useDeleteClientAction` |
| `contract` | `useContracts` (자동), `useContractDetail` (수동) | `useRegisterContractAction`, `useUpdateContractAction` |
| `workplace` | `useWorkplaces` (수동), `useWorkplaceDetail` (자동) | `useRegisterWorkplaceAction`, `useUpdateWorkplaceAction`, `useDeleteWorkplaceAction` |
| `stack` | `useStacks` (수동), `useStackDetail` (수동) | `useRegisterStackAction`, `useUpdateStackAction`, `useRegisterFacilityAction`, `useUpdateFacilityAction`, `useDeleteFacilityAction`, `useRegisterPreventionAction`, `useUpdatePreventionAction`, `useDeletePreventionAction` |
| `pollutant` | `usePollutants` (자동) | `useRegisterPollutantAction` |
| `stack-pollutant` | `useStackPollutants` (수동) | `useRegisterStackPollutantAction` |
| `auth` | — | `useAuth`(Context 훅), API: `signInApi`, `signOutApi` |
| `dashboard` | — (model 훅 없음) | — (API: `dashboardApi`만 존재) |

> `auth`, `dashboard`는 표준 CRUD 패턴을 따르지 않는다. `auth`는 인증 Context(`useAuth`, `AuthContext`)와 로그인/로그아웃 API를, `dashboard`는 조회 전용 `dashboardApi`만 노출하며 model 레이어 훅이 없다.

---

## 도메인 입력 모델 목록

각 entity에서 외부 노출 가능한 입력 모델(등록/수정용 도메인 타입)은 아래와 같습니다.

| Entity | 노출 타입 |
|--------|-----------|
| `client` | `Client`, `ClientCreate`, `ClientUpdate` |
| `contract` | `Contract`, `ContractListItem`, `ContractDetail`, `ContractCreate`, `ContractUpdate`, `ContractAmountUnit` |
| `workplace` | `Workplace`, `WorkplaceListItem`, `WorkplaceCreate`, `WorkplaceUpdate`, `ContractOverview` |
| `stack` | `Stack`, `StackCreate`, `StackUpdate`, `StackListItem`, `StackDetail`, `Prevention`, `PreventionCreate`, `PreventionUpdate`, `Facility`, `FacilityCreate`, `FacilityUpdate` |
| `pollutant` | `Pollutant`, `PollutantCreate` |
| `stack-pollutant` | `StackPollutantListItem`, `StackPollutantCreate` |
