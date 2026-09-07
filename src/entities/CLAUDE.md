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
│   ├── query-keys.ts               # 쿼리 키 팩토리 (index.ts 로 노출)
│   ├── queries.ts                  # 쿼리 정의 — 선언형/명령형이 공유할 때만 (schedule 만 사용)
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

**서버 상태는 `@tanstack/react-query` 가 소유한다.** 엔티티 훅은 그 위에 얇은 어댑터를 얹어
`{ data, isLoading, error, refetch }` 계약을 유지한다 — 호출부는 react-query 를 알지 않는다.

### 쿼리 키 — `model/query-keys.ts`

슬라이스마다 키 팩토리를 두고 `index.ts` 로 노출한다. 무효화 범위를 지정하려면
features·widgets 도 키에 접근할 수 있어야 한다.

```ts
export const clientKeys = {
  all: ["client"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: () => [...clientKeys.lists()] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};
```

계층으로 쌓는 이유는 **상위 키 하나로 하위를 통째로 무효화**하기 위해서다 —
`invalidateQueries({ queryKey: clientKeys.all })` 이면 목록·상세가 함께 갱신된다.

키에 담는 값은 **원시값만** 쓴다. 객체를 넣으면 매 렌더 새 참조라 캐시가 갈린다.

> **함께 갱신돼야 하는 것은 같은 `all` 아래 둔다.** 예를 들어 채택 측정물질과 채택 후보는
> 한쪽을 바꾸면 반드시 다른 쪽도 바뀌므로(후보를 채택하면 후보에서 빠지고 목록에 들어온다)
> `pollutantKeys.all` 하나로 묶여 있다.

### 조회 훅 — `useEntityQuery`

마운트 시 조회하고 조건이 바뀌면 다시 조회한다. **`useFetch`/`useLazyFetch` 로 나뉘던
타입 A/B 구분은 없어졌다** — 수동 조회도 `enabled` 로 표현한다.

```ts
export const useClients = () =>
  useEntityQuery<Client[]>({
    queryKey: clientKeys.list(),
    queryFn: async () => unwrapMessage(await clientApi.getClientList()),
    initialData: [],
  });
```

| 옵션 | 용도 |
|------|------|
| `queryKey` | 캐시 식별자. 바뀌면 다시 조회한다(예전 `deps` 자리) |
| `queryFn` | 응답 판정까지 마친 값을 반환. 실패는 `unwrapMessage`/`unwrap` 이 던진다 |
| `initialData` | 조회 전·비활성 상태의 값. 참조가 고정돼 호출부의 `useMemo([data])` 가 헛돌지 않는다 |
| `enabled` | false 면 조회하지 않고 로딩도 아니다 |
| `staleTime` | 거의 바뀌지 않는 마스터 데이터만 길게 잡는다(`useRoles`·`usePollutantCatalogs` 가 5분) |
| `invalidateKey` | `refetch()` 가 무효화할 범위. 기본은 자기 키. 필터가 있는 목록은 `keys.lists()` 를 준다 |
| `fallbackMessage` | 요청 자체가 실패했을 때의 문구 |

**`refetch` 의 의미가 달라졌다.** 예전에는 그 훅 인스턴스만 다시 불렀지만, 이제
`invalidateQueries` 로 **같은 키를 구독하는 모든 곳**을 갱신한다. 갱신 완료를 기다려야 하는
호출부를 위해 Promise 를 돌려준다.

> **`placeholderData`·`keepPreviousData` 를 쓰지 말 것.** 예전 `resetOnChange: true` 가 막던
> 회귀 — 키가 바뀌었는데 이전 대상의 값이 잠깐 남아 보이는 것 — 가 그대로 돌아온다.
> 지정하지 않으면 키 변경 시 `data` 가 `undefined` 가 되고 어댑터가 `initialData` 로 받는다.

#### 조건부 조회 — `null` 필터와 `enabled` 를 혼동하지 말 것

둘은 다른 뜻이다. 서버가 필터 없는 전체 목록을 지원하는 엔드포인트(`stack`·`workplace`·
`stack-pollutant`)에서 특히 갈린다.

```ts
useStacks(null)                                   // 필터 없이 전체 측정시설
useStacks(id, { enabled: id != null })            // 아직 사업장을 고르지 않아 조회하지 않음
```

### 명령형 조회 — `queryClient.fetchQuery`

조회 결과를 **다음 렌더가 아니라 그 자리에서** 대조해야 하는 호출부가 있다
(저장이 409 로 거절됐을 때 서버 최신본과의 대조, 저장 직후 폼 되맞추기).
`refetch()` 는 값을 동기 반환하지 않으므로 이 경로는 명령형 조회를 따로 노출한다.

쿼리 정의(`model/queries.ts`)를 선언형 훅과 **공유해야** 같은 캐시를 본다.

```ts
export const useFetchScheduleDetail = () => {
  const queryClient = useQueryClient();
  return useCallback(async (id: number) => {
    try { return await queryClient.fetchQuery(scheduleDetailQuery(id)); }
    catch { return null; }          // 조회 실패는 화면이 안내하고 흐름은 이어진다
  }, [queryClient]);
};
```

현재 사용처: `entities/schedule` 의 `useFetchScheduleDetail`·`useFetchScheduleAnalyses` 둘뿐이다.

### 액션 훅 — `useEntityMutation`

도메인 입력 모델을 받아 `api/mapper.ts` 로 DTO 변환 후 API 를 호출한다.
**액션 훅이 새로 갖는 유일한 책임은 성공 시 무효화다.**

```ts
export const useRegisterClientAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (data: ClientCreate) => {
      unwrapMessage(await clientApi.registerClient(toRegisterRequest(data)));
    },
    { invalidateKeys: [clientKeys.all] },
  );

  return { registerClient: run, isLoading, error };
};
```

- **콜백 옵션을 받지 않는다.** toast·모달 닫기·폼 리셋·화면 이동은 feature 훅이 맡는다.
- **에러는 삼키지 않고 다시 던진다**(`mutateAsync` 계약). feature 의 `try/catch` 가 그대로 산다.
- `run` 은 **참조가 고정**돼 있고 인자를 그대로 받는다(`updateClient(id, data)`).
- `isLoading` 은 `mutation.isPending` 이다.

#### `useEntityMutation` 을 쓰지 않는 경우

mutation 수명주기에 개입해야 하면 `useMutation` 을 직접 조립한다. 현재 세 갈래다.

| 갈래 | 훅 | 이유 |
|------|----|------|
| 파일 다운로드 | `useDownloadDocumentAction`, `useExportReportAction`, `useExportSamplingRecordsAction` | 무효화 대상이 아니다. `res.status` 를 직접 판별하고(`ApiResponseMessage.status` 가 바이너리 응답엔 없다) `{ blob, filename }` 만 반환한다 — **엔티티는 DOM 을 만지지 않는다** |
| 순서 변경 | `useReorderFacilitiesAction`, `useReorderPreventionsAction`, `useReorderItemsAction` | **무효화하지 않고 캐시를 직접 고쳐 넣는다.** 낙관적 반영·롤백은 이미 feature 가 소유하고, 여기서 재조회를 걸면 목록이 깜빡이고 아코디언이 닫힌다 |
| 낙관적 토글 | `useTogglePollutantCatalogAction` | 스위치가 응답을 기다리는 동안 꺼진 채로 남으면 눌리지 않은 것으로 읽힌다. `onMutate` 로 먼저 반영하고 `onError` 로 되돌린다 |

#### 409 충돌은 상태 코드를 보존해야 한다

`schedule` 의 `saveSheets`·`updateBasicInfo` 만 `unwrap`(`@shared/api`)을 거쳐 `ApiError` 를 던진다.
`updateSchedule` 은 이름이 비슷해도 **일반 계약**이다 — 이름으로 일괄 판단하지 말 것.

| 규칙 | 근거 |
|------|------|
| `mutationFn` 은 `unwrap` 을 그대로 쓴다 | `unwrapMessage` 로 바꾸면 상태 코드가 사라져 409 분기가 죽는다 |
| **`onError` 에 전역 409 처리를 넣지 않는다** | 같은 `updateBasicInfo` 를 쓰는 `use-analysis-progress` 에는 409 특례가 없다(단순 toast). 전역 처리는 그쪽 UX 를 바꾼다 |
| 분기는 `err instanceof ApiError && err.isConflict` 로 좁힌다 | `instanceof Error` 로 넓히면 409 분기가 죽는다 |

### 재시도 정책은 `shared/api/query-client.ts` 가 소유한다

`axiosPrivate` 인터셉터가 에러 응답을 `Promise.resolve` 로 되돌리므로(401 재발급 흐름)
업무 실패는 `unwrapMessage`/`unwrap` 이 던지는 시점에 드러난다. 그래서 기본 `retry: 3` 을 쓰면
**권한 없음·검증 실패·409 를 3번씩 되묻게 된다.** `ApiResponseError`·`ApiError` 는 재시도하지 않고,
요청 자체의 실패(네트워크 단절)만 재시도한다. mutation 은 `retry: false` 다.

✅ 허용
- API 호출
- 로딩·에러 상태 관리
- DTO ↔ Domain 변환
- 도메인 데이터 반환
- **성공 시 자기 도메인 키 무효화**

❌ 금지
- Entity Layer의 Hook에서 UI 후처리 로직을 직접 수행하지 않는다.
- Entity Layer는 도메인 기능만 알아야 하며 UI 상태 변경, 화면 이동, 모달 제어, 토스트 출력 등은 Feature Layer의 사용자 시나리오 책임
- **다른 슬라이스의 키를 무효화하지 않는다** — 같은 레이어 cross-import 다. 슬라이스를 넘는 갱신은
  조합하는 page 가 콜백으로 잇는다(`ClientManagementPage` 의 의뢰기관 → 사업장이 유일한 사례).

---

## Entity별 노출 훅 목록

| Entity | 페칭 훅 | 액션 훅 |
|--------|---------|---------|
| `client` | `useClients`, `useClientDetail` | `useRegisterClientAction`, `useUpdateClientAction`, `useDeleteClientAction` |
| `contract` | `useContracts`, `useContractDetail` | `useRegisterContractAction`, `useUpdateContractAction` |
| `workplace` | `useWorkplaces`, `useWorkplaceDetail` | `useRegisterWorkplaceAction`, `useUpdateWorkplaceAction`, `useDeleteWorkplaceAction` |
| `stack` | `useStacks`, `useStackDetail` | `useRegisterStackAction`, `useUpdateStackAction`, `useRegisterFacilityAction`, `useUpdateFacilityAction`, `useDeleteFacilityAction`, `useReorderFacilitiesAction`, `useRegisterPreventionAction`, `useUpdatePreventionAction`, `useDeletePreventionAction`, `useReorderPreventionsAction` |
| `stack-pollutant` | `useStackPollutants` | `useRegisterStackPollutantAction` |
| `pollutant` | `usePollutants`(자동, 채택분), `usePollutantCandidates`(자동, 미채택 가이드 항목) | `useRegisterPollutantAction`, `useUpdatePollutantAction`, `useDeletePollutantAction` |
| `pollutant-catalog` | `usePollutantCatalogs`(자동) | `useRegisterPollutantCatalogAction`, `useUpdatePollutantCatalogAction`, `useTogglePollutantCatalogAction` |
| `document` | `useDocuments`, `useDocumentDetail`, `useDocumentVersions` | `useRegisterDocumentAction`, `useAddDocumentVersionAction`, `useUpdateDocumentAction`, `useDeleteDocumentAction`, `useDownloadDocumentAction` |
| `equipment` | `useEquipments`, `useEquipmentDetail`, `useInspectionRecords` | `useRegisterEquipmentAction`, `useUpdateEquipmentAction`, `useDeleteEquipmentAction`, `useChangeEquipmentStatusAction`, `useRecordInspectionAction` |
| `member` | `useMembers`, `useMemberDetail`, `useRoles` | `useRegisterMemberAction`, `useUpdateMemberAction`, `useDeleteMemberAction` |
| `team` | `useTeams`, `useTeamDetail` | `useRegisterTeamAction`, `useUpdateTeamAction`, `useDeleteTeamAction` |
| `schedule` | `useSchedules`, `useCanceledSchedules`, `useScheduleDetail`, `useScheduleAnalyses`, `useFetchScheduleDetail`(명령형), `useFetchScheduleAnalyses`(명령형) | `useRegisterScheduleAction`, `useUpdateScheduleAction`, `useUpdateBasicInfoAction`, `useChangeClientAction`, `useChangeItemsAction`, `useChangeEquipmentsAction`, `useSaveSheetsAction`, `useDeleteScheduleAction`, `useExportSamplingRecordsAction` |
| `tenant` | `useTenants` | `useProvisionTenantAction` |
| `auth` | — | `useAuth`(Context 훅). API: `signInApi`, `signOutApi` |
| `dashboard` | — (model 훅 없음) | — (API: `dashboardApi` 만 존재) |

> `auth`, `dashboard` 는 표준 CRUD 패턴을 따르지 않는다.
> 두 슬라이스 모두 **DTO 를 public API 로 노출하는 규칙 위반 상태**이며(아래 참조), 정리 대상이다.

### 표준 패턴 예외

| 훅 | 예외 사유 |
|----|----------|
| `document/model/use-download-document-action.ts` | `AxiosResponse<Blob>` 반환 — `ApiResponseMessage<T>` 계약 밖 |
| `schedule/model/use-export-report-action.ts` | 위와 동일 |
| `schedule/model/use-export-sampling-records-action.ts` | 위와 동일 |
| `schedule/model/use-previous-sheet.ts`, `use-previous-sheet-candidates.ts` | 반환이 `{ 값, errorMessage }` 복합이라 "없음(정상)"과 "실패"를 구분해야 한다. 단일 값 계약으로 표현할 수 없어 손으로 배선한다 |

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
