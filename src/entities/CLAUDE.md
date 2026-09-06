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
├── model/
│   ├── types.ts                    # 순수 도메인 타입만
│   ├── use-xxxs.ts                 # 데이터 페칭 훅
│   ├── use-register-xxx-action.ts  # 등록 액션 훅
│   ├── use-update-xxx-action.ts    # 수정 액션 훅 (필요시)
│   └── use-delete-xxx-action.ts    # 삭제 액션 훅 (필요시)
└── lib/                            # 순수 도메인 계산 (선택)
    ├── xxx-calc.ts
    └── xxx-calc.test.ts
```

### `lib/` 세그먼트

API·React 에 의존하지 않는 **순수 도메인 계산**만 담는다.
부수효과·상태·훅을 두지 않으며, **테스트를 같은 디렉토리에 함께 둔다.**

이 경계가 없으면 `lib/` 는 곧 잡동사니 폴더가 된다. 계산이 아니면 `model/` 이나
`shared/lib`(도메인 무관 유틸) 중 맞는 쪽으로 보낸다.

현재 사용 슬라이스: `entities/schedule/lib/` (`sheet-calc/`, `nozzle-recommend.ts`)

계산 로직이 여러 스텝으로 커지면 파일 하나가 아니라 **디렉토리 + `index.ts`** 로 쪼갠다.
`sheet-calc/` 가 그 표준이다 — 유틸(`math`·`convert`·`formula`)·상수·타입·스텝(`steps/*-step.ts`)·
파이프라인(`run.ts`)을 분리하고, 외부에는 `index.ts` 만 노출한다.

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
**`useFetch`(`@shared/model`)를 쓴다.** 상태 배선(`data`/`isLoading`/`error`/`refetch`)과 세 가지
방어 — 늦게 도착한 응답 무시, 조건 변경 시 렌더 중 상태 되돌리기, 성공 시 직전 에러 지우기 — 를
공통 훅이 소유한다. 개별 훅은 "무엇을 어떤 조건으로 부르는가"만 남는다.

```ts
export const useClients = () =>
  useFetch<Client[]>(async () => unwrapMessage(await clientApi.getClientList()), []);
```

| 옵션 | 용도 |
|------|------|
| `deps` | 조회 조건. **원시값만** 담는다 — 키를 이어 붙여 비교하므로 객체를 넣으면 매 렌더 달라진다 |
| `enabled` | false면 조회하지 않고 로딩도 아니다(모달이 닫혀 있는 동안) |
| `resetOnChange` | 조건이 바뀌면 이전 결과를 즉시 버린다. 다른 대상의 값이 잠깐 남아 보이면 안 될 때 |

응답 판정은 `unwrapMessage`(`@shared/api`)가 한다 — `status: false` 는 `ApiResponseError` 로
던져 서버 문구가 그대로 화면에 남고, 요청 자체가 실패하면 표준 문구로 덮인다.

```ts
return { data, isLoading, error, refetch, clear };
```

### 데이터 페칭 훅 — 타입 B: 수동 호출

마운트 시 자동 호출하지 않고, 외부에서 `fetchXxx(id)`를 명시적으로 호출해야 데이터를 로드한다.
부모 컴포넌트의 선택 이벤트에 의해 트리거되는 종속 데이터에 사용한다.

**`useLazyFetch`(`@shared/model`)를 쓴다.** 트리거 이름만 슬라이스가 정한다.

적용 entity: `workplace` (`useWorkplaces`), `stack` (`useStacks`, `useStackDetail`), `contract` (`useContractDetail`), `stack-pollutant` (`useStackPollutants`), `schedule` (`useScheduleDetail`, `useScheduleAnalyses`)

```ts
export const useWorkplaces = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (clientId: number | null) => toWorkplaceListItems((await workplaceApi.getWorkplaces(clientId)).data),
    [] as WorkplaceListItem[],
    { resetOnFetch: true },
  );

  return { data, isLoading, error, fetchWorkplaces: fetch };
};
```

> 반환 함수명이 `fetchXxx` 인 것은 의도된 것이다. 루트 `CLAUDE.md` 의 "조회는 `get`" 규칙은
> `api/api.ts` 의 API 함수 대상이고, 이쪽은 상태를 갱신하는 명령형 트리거다.
>
> 트리거는 **조회한 값을 함께 반환**한다(`Promise<T | null>`). 저장이 409로 거부됐을 때 서버
> 최신본을 받아 곧바로 대조해야 하는 호출부가 있고, 다음 렌더의 `data` 를 기다리면 비동기
> 흐름이 꼬이기 때문이다. 실패는 `null` 이며 예외를 던지지 않는다 — 조회 실패는 `error` 상태로
> 화면이 안내하고 흐름은 이어져야 한다.

### 액션 훅 — CRUD 작업

**`useAsyncAction`(`@shared/model`)을 쓴다.** 도메인 입력 모델을 받아 `api/mapper.ts`로 DTO 변환 후
API를 호출한다. `isLoading`·`error` 배선과 실패 시 재던지기는 공통 훅이 소유한다.

```ts
export const useRegisterClientAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: ClientCreate) => {
    unwrapMessage(await clientApi.registerClient(toRegisterRequest(data)));
  });

  return { registerClient: run, isLoading, error };
};
```

> **에러는 삼키지 않고 다시 던진다.** 엔티티는 도메인 기능만 알아야 하므로 토스트·모달·화면 이동은
> feature 훅이 맡는다. `error` 상태를 함께 두는 것은 엔티티 자신의 상태를 위해서다.
>
> `run` 은 **참조가 고정**돼 있다 — 호출부가 `useEffect` 의존성에 넣어도 무한 루프가 되지 않는다.

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
| `client` | `useClients`(자동), `useClientDetail`(자동) | `useRegisterClientAction`, `useUpdateClientAction`, `useDeleteClientAction` |
| `contract` | `useContracts`(자동), `useContractDetail`(수동) | `useRegisterContractAction`, `useUpdateContractAction` |
| `workplace` | `useWorkplaces`(수동), `useWorkplaceDetail`(자동) | `useRegisterWorkplaceAction`, `useUpdateWorkplaceAction`, `useDeleteWorkplaceAction` |
| `stack` | `useStacks`(수동), `useStackDetail`(수동) | `useRegisterStackAction`, `useUpdateStackAction`, `useRegisterFacilityAction`, `useUpdateFacilityAction`, `useDeleteFacilityAction`, `useReorderFacilitiesAction`, `useRegisterPreventionAction`, `useUpdatePreventionAction`, `useDeletePreventionAction`, `useReorderPreventionsAction` |
| `stack-pollutant` | `useStackPollutants`(수동) | `useRegisterStackPollutantAction` |
| `pollutant` | `usePollutants`(자동, 채택분), `usePollutantCandidates`(자동, 미채택 가이드 항목) | `useRegisterPollutantAction`, `useUpdatePollutantAction`, `useDeletePollutantAction` |
| `pollutant-catalog` | `usePollutantCatalogs`(자동) | `useRegisterPollutantCatalogAction`, `useUpdatePollutantCatalogAction`, `useTogglePollutantCatalogAction` |
| `document` | `useDocuments`, `useDocumentDetail`, `useDocumentVersions` | `useRegisterDocumentAction`, `useAddDocumentVersionAction`, `useUpdateDocumentAction`, `useDeleteDocumentAction`, `useDownloadDocumentAction` |
| `equipment` | `useEquipments`, `useEquipmentDetail`, `useInspectionRecords` | `useRegisterEquipmentAction`, `useUpdateEquipmentAction`, `useDeleteEquipmentAction`, `useChangeEquipmentStatusAction`, `useRecordInspectionAction` |
| `member` | `useMembers`, `useMemberDetail`, `useRoles` | `useRegisterMemberAction`, `useUpdateMemberAction`, `useDeleteMemberAction` |
| `team` | `useTeams`, `useTeamDetail` | `useRegisterTeamAction`, `useUpdateTeamAction`, `useDeleteTeamAction` |
| `schedule` | `useSchedules`, `useScheduleDetail`(수동) | `useRegisterScheduleAction`, `useUpdateScheduleAction`, `useUpdateBasicInfoAction`, `useChangeClientAction`, `useChangeItemsAction`, `useChangeEquipmentsAction`, `useSaveSheetsAction`, `useDeleteScheduleAction`, `useExportSamplingRecordsAction` |
| `tenant` | `useTenants` | `useProvisionTenantAction` |
| `auth` | — | `useAuth`(Context 훅). API: `signInApi`, `signOutApi` |
| `dashboard` | — (model 훅 없음) | — (API: `dashboardApi` 만 존재) |

> `auth`, `dashboard` 는 표준 CRUD 패턴을 따르지 않는다.
> 두 슬라이스 모두 **DTO 를 public API 로 노출하는 규칙 위반 상태**이며(아래 참조), 정리 대상이다.

### 표준 패턴 예외

| 훅 | 예외 사유 |
|----|----------|
| `document/model/use-download-document-action.ts` | `AxiosResponse<Blob>` 반환 — `ApiResponseMessage<T>` 계약 밖 |
| `schedule/model/use-export-sampling-records-action.ts` | 위와 동일 |

파일 다운로드 경로는 `shared/api/blob-error.ts`(`readBlobErrorMessage`) 로 blob 응답의
에러 본문을 읽고, `shared/lib/file/` 의 `downloadBlob`·`parseAttachmentFilename` 으로
브라우저 다운로드를 트리거한다. **엔티티는 DOM 을 만지지 않고 `{ blob, filename }` 만 반환한다.**

### 알려진 위반 사항

| 위치 | 문제 |
|------|------|
| `auth/index.ts` | `SignInRequest`/`SignInResponse` DTO 를 export (규칙상 금지) |
| `dashboard/index.ts` | `model/` 이 없어 응답 DTO 4종을 그대로 export |

---

## 도메인 입력 모델 목록

각 entity에서 외부 노출 가능한 입력 모델(등록/수정용 도메인 타입)은 아래와 같습니다.

| Entity | 노출 타입 |
|--------|-----------|
| `client` | `Client`, `ClientCreate`, `ClientUpdate` |
| `contract` | `ContractListItem`, `ContractDetail`, `ContractCreate`, `ContractUpdate` |
| `workplace` | `Workplace`, `WorkplaceListItem`, `WorkplaceCreate`, `WorkplaceUpdate` |
| `stack` | `Stack`, `StackCreate`, `StackUpdate`, `StackListItem`, `StackDetail`, `Prevention`, `PreventionCreate`, `PreventionUpdate`, `Facility`, `FacilityCreate`, `FacilityUpdate` |
| `stack-pollutant` | `StackPollutantListItem`, `StackPollutantCreate` |
| `pollutant` | `Pollutant`, `PollutantCandidate`, `PollutantCreate`, `PollutantUpdate` |
| `pollutant-catalog` | `PollutantCatalog`, `PollutantCatalogCreate`, `PollutantCatalogUpdate` |
| `document` | `Document`, `DocumentVersion`, `DocumentCreate`, `DocumentVersionCreate`, `DocumentUpdate`, `DocumentDownload` |
| `equipment` | `Equipment`, `EquipmentCreate`, `EquipmentUpdate`, `EquipmentStatusChange`, `InspectionItem`, `InspectionItemInput`, `InspectionRecord`, `InspectionRecordCreate`, `EquipmentSpec` 및 종류별 Spec 타입 |
| `member` | `Member`, `MemberCreate`, `MemberUpdate`, `Role` |
| `team` | `Team`, `TeamCreate`, `TeamUpdate` |
| `schedule` | `ScheduleListItem`, `ScheduleCreate`, `ScheduleMetaUpdate`, `ScheduleDetail`, 스냅샷 타입군(`ClientSnapshot`·`TenantSnapshot` 등), `SamplingSheet` 및 기록지 하위 타입군, `lib/` 계산 타입(`SheetCalcPreview`, `NozzleRecommendation`) |
| `tenant` | `Tenant`, `TenantProvision`, `TenantAdminCreate` |

> **공용 enum·레이블은 entity 에 두지 않는다.** `MeasurementField`, `Grade`, `DocumentCategory`,
> `ContractAmountUnit`, `TenantStatus`, `SubscriptionPlan`, `UserRole` 등은
> `shared/model/types/common-types.ts` 에, 레이블맵은 `shared/config/labels.ts` 에 있다.
> 정확한 목록은 각 슬라이스의 `index.ts` 를 확인한다.
