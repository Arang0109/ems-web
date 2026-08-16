# widgets 레이어

여러 entity/feature를 조합하는 복합 UI 블록입니다.

---

## 책임 범위

- entity 훅으로 데이터를 받아 UI로 표현
- feature 훅/컴포넌트를 조합 (예: 등록 폼 다이얼로그 포함)
- TanStack Table 상태, 필터, 페이지네이션 관리
- 폼 상태는 feature 훅에서 관리하고 widget은 prop으로 전달받는 것을 권장

---

## 두 가지 위젯 패턴

### 패턴 A — 단순 위젯 (layouts, metrics, dashboard-stats, dashboard-alerts, sign-in)

```
widget-name/
├── index.ts
└── ComponentName.tsx   # ui/ 없이 루트에 위치 허용
```

### 패턴 B — 테이블 위젯 (13개)

`client-table`, `workplace-table`, `stack-table`, `stack-list-table`, `contract-table`,
`pollutant-table`, `document-table`, `equipment-table`, `member-table`, `team-table`,
`team-schedule-table`, `schedule-table`, `tenant-table`

```
widget-name/
├── index.ts
├── model/
│   ├── types.ts            # TableRow 타입 정의
│   ├── columns.ts          # TanStack Table ColumnDef 정의
│   ├── mapper.ts           # Entity → TableRow 변환 함수
│   ├── mobile-card.tsx     # 모바일 카드 표현 선언 (선택)
│   └── use-xxx-table.ts    # 테이블 상태 관리 훅
└── ui/
    ├── XxxTable.tsx        # 메인 테이블 컴포넌트 (렌더링만 담당)
    └── Cells.tsx           # 커스텀 셀 컴포넌트
```

### 패턴 C — 프로파일/상세 위젯 (stack-profile, schedule-profile)

탭 또는 여러 상세 섹션으로 하나의 도메인 객체를 보여주는 위젯. 탭·섹션별 하위 컴포넌트를 `ui/children/`에 분리한다.

```
stack-profile/
├── index.ts
├── model/
│   ├── types.ts             # 프로파일 표시용 타입
│   ├── mapper.ts            # Entity(Detail) → 프로파일 표시 모델 변환
│   └── use-stack-profile.ts # 데이터 조합/상태 훅
└── ui/
    ├── StackProfile.tsx     # Tabs 조합 (측정지점/측정항목/측정이력)
    └── children/            # 탭별 서브 컴포넌트 (렌더링 단위)
        ├── StackBasicInfo.tsx    ┐ 셋 다 "측정지점" 탭 하나에 SectionAccordion 으로 쌓인다
        ├── FacilityInfo.tsx      │ (하나의 굴뚝을 다른 각도에서 본 것이라 대조하며 봐야 함)
        ├── PreventionInfo.tsx    ┘
        └── MeasurementInfo.tsx   # register-stack-pollutant feature 폼 조합
```

> 탭 본문이 자체 카드(`SectionAccordion`)를 가지면 `Tabs` 옵션에 `panel: false` 를 준다.
> 켜둔 채로 두면 탭의 카드 셸과 겹쳐 이중 카드가 된다.

- 탭 컨테이너(`StackProfile.tsx`)는 `@shared/ui/tabs`의 `Tabs`로 구성하고, 각 탭 본문은 `ui/children/`의 서브 컴포넌트가 담당한다.
- 하위 탭이 feature(등록 폼 등)를 조합할 수 있다. 예: `MeasurementInfo.tsx` → `@features/register-stack-pollutant`.

---

## 테이블 위젯 규칙

### TableRow 타입 (`model/types.ts`)

- Entity 타입과 **별개로** 테이블 표시 전용 타입을 정의
- 포맷된 데이터(사업자번호 `238-32-48234`)나 변환된 라벨(`'대기'`)을 포함
- Entity 원본 타입을 그대로 사용하지 말 것

```typescript
// entity 타입 (원본)
type Client = { bizNumber: string; ... }

// widget 테이블 row 타입 (포맷된 표시용)
type ClientTableRow = { bizNumber: string; ... }  // "238-32-48234" 형태로 저장
```

### Mapper (`model/mapper.ts`)

- Entity/DTO → TableRow 변환 순수 함수
- `@shared/lib`의 `formatBusinessNumber`, `formatPhoneNumber`, `formatAddress` 등 활용
- `shared/model/common-types`의 레이블맵(`MEASUREMENT_FIELD_LABEL` 등) 활용

```typescript
export function toClientRows(row: ClientListResponse): ClientTableRow {
  return {
    ...row,
    bizNumber: formatBusinessNumber(row.bizNumber),
  };
}
```

### 테이블 훅 (`model/use-xxx-table.ts`)

테이블 컴포넌트가 UI 렌더링만 담당할 수 있도록, 상태·데이터·로직을 훅으로 분리한다.

**`useDataTable`(`@shared/model`)을 쓴다.** `useReactTable` 을 직접 호출하지 않는다 —
`useDataTable` 이 정렬·필터·페이지네이션 배선과 `meta` 주입을 책임지므로,
상세보기 콜백 키가 어긋나는 버그(실제로 발생했던 클래스)가 구조적으로 불가능해진다.

```typescript
export const useClientTable = ({ onRowClick }: Props) => {
  // 모달 상태 — boolean 은 is 접두어
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const { data, loading, error, refetch } = useClients();
  const tableData = useMemo(() => data?.map(toClientRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.COMPACT,           // @shared/config — 매직넘버 금지
    onViewDetail: (row) => { /* 모달 열기 또는 navigate */ },
  });

  return { table, loading, error, refetch, globalFilter, setGlobalFilter, ... };
};
```

> **현황:** 13개 테이블 위젯 중 12개가 `useDataTable` 을 쓴다. 남은 1개
> (`tenant-table`)만 아직 `useTableState` + `useReactTable` 직접 호출이다.
> 신규 위젯은 반드시 `useDataTable` 을 쓰고, 기존 위젯도 손댈 때 전환한다.

#### 상세보기 대상은 **클릭된 행**에서 온다

`onViewDetail` 은 `RowActionCell` 이 넘긴 `row.original` 을 받는다. 이 인자를 무시하고
페이지가 내려준 `selectedXxx` prop 을 모달에 쓰면, "선택된 행"과 "상세보기를 누른 행"이
어긋난다. 지금 화면이 맞아 보이는 것은 `DesktopTable` 의 `<tr onClick>` 으로 버튼 클릭이
버블링되는 우연에 기댄 것이므로 규칙으로 막는다.

```typescript
// ❌ 인자를 버리고 외부 선택 상태에 의존
onViewDetail: () => setUpdateModalOpen(true)

// ✅ 행의 id 를 보관하고 목록 원본에서 파생 (refetch 후에도 최신 값을 따른다)
const [detailId, setDetailId] = useState<number | null>(null);
const detail = useMemo(() => data.find((x) => x.id === detailId) ?? null, [data, detailId]);
onViewDetail: (row) => { setDetailId(row.id); setUpdateModalOpen(true); }
```

TableRow 는 표시용 포맷 값이므로 폼 초기값으로 쓸 수 없다 — 반드시 목록 **원본**에서 찾는다.
목록 응답과 상세 응답이 같은 DTO 인 도메인(`client`·`member`·`team`·`document`·`equipment`)은
이것으로 충분하며, 페이지가 `useXxxDetail` 로 다시 받아 prop 으로 되돌려줄 필요가 없다.
목록이 상세의 부분집합인 도메인(`stack` 등)에서만 상세 조회를 둔다.

### 공통 셸 조합

테이블 위젯의 셸 마크업은 직접 쓰지 않고 `@shared/ui/table` 의 부품을 조합한다.

| 부품 | 역할 |
|------|------|
| `TablePanel` | 패널 셸 — 제목 + 액션 슬롯 + 본문 + footer 슬롯 |
| `BasicTable` | `DesktopTable` + `MobileCardList` 조합기 (md 미만에서 카드 전환) |
| `TableFooterBar` | 건수 + 페이지네이션 바 |
| `TablePagination` | 페이지 이동 |
| `TableEmptyState` | 빈 상태 |
| `RowActionCell` | 행 상세보기 버튼 — `useDataTable({ onViewDetail })` 이 주입한 콜백을 읽는다 |

### 모바일 대응

`BasicTable` 은 `useIsMobile`(`@shared/model`) 로 md 미만을 감지해 카드 목록으로 전환한다.
카드 표현은 `model/mobile-card.tsx` 에 선언형으로 정의하고 `mobileCard` prop 으로 넘긴다
(`MobileCardConfig | false`). 현재 `client-table`, `schedule-table` 이 사용한다.

본문 필드 배치는 `columns`(1·2·3, 기본 1) + 필드별 `span`(`1|2|3|'full'`) 으로 선언한다.
행은 선언 순서대로 채워지므로 행 인덱스를 직접 지정하지 않는다. 그리드 클래스 해석은
`MobileCardList` 안의 정적 맵이 전담하므로 위젯이 `className` 을 넘기지 않는다.

```ts
export const clientCardConfig: MobileCardConfig<ClientTableRow> = {
  columns: 2,
  fields: [
    { label: '의뢰기관', content: (row) => row.name },
    { label: '사업자번호', content: (row) => row.bizNumber },
    { label: '주소', content: (row) => row.address, span: 'full' },
  ],
};
```

**컴포넌트는 훅의 반환값을 구조분해하여 렌더링만 담당한다:**

```typescript
export const ClientTable = ({ onRowClick }: Props) => {
  const { table, loading, error, ... } = useClientTable({ onRowClick });
  return ( /* JSX만 */ );
};
```

### Columns (`model/columns.ts`)

- `createColumnHelper<TableRow>()` 사용
- 커스텀 셀은 `ui/Cells.tsx`에 분리
- 상세보기 컬럼은 `columnHelper.display({ id: 'actions', cell: RowActionCell })` 로 쓴다.
  위젯마다 `ActionCell`/`PathCell` 을 따로 만들지 않는다.
- `declare module '@tanstack/react-table'` 로 `TableMeta` 를 위젯에서 재선언하지 않는다.
  공통 선언은 `shared/model/types/table-types.ts` 에 있다.

---

## 폼 다이얼로그 조합 — `key` 리마운트는 필수다

feature 폼(`RegisterXxxForm`·`UpdateXxxForm` 등)을 렌더할 때 **`useRemountKey`(`@shared/model`)
로 만든 key 를 반드시 붙인다.**

```tsx
const registerFormKey = useRemountKey(registerModalOpen);
const updateFormKey = useRemountKey(updateModalOpen);

<RegisterClientForm key={registerFormKey} open={registerModalOpen} ... />
<UpdateClientForm   key={updateFormKey}   open={updateModalOpen} client={detailClient} ... />
```

폼 상태는 feature 훅(`useRegisterClient` 등)에 있고, 그 훅은 다이얼로그 팝업 **바깥**의
feature 컴포넌트에 산다. 그래서 Base UI 가 닫으면서 팝업을 언마운트해도 입력값이 남는다.
등록 폼은 제출 **성공 시에만** 초기화하므로 입력하다 닫으면 그대로 남고, 수정 폼은
`key={item.id}` 만으로는 **같은 행을 다시 열 때** key 가 안 바뀌어 수정하던 값이 남는다.

`useRemountKey` 는 닫힐 때가 아니라 **열릴 때** key 를 바꾸므로 닫힘 애니메이션은 유지된다.

> 열려 있는 동안 갱신된 데이터를 폼에 반영해야 하는 경우(예: 상세 모달 안에서 검사 이력을
> 등록해 장비가 바뀌는 `equipment-table`)에만 데이터 의존값을 key 에 덧붙인다.
> `key={`${updateFormKey}-${detail?.id}-${detail?.modifiedAt}`}`

---

## Widget Props 규칙

### 크로스 위젯 동작명 금지

Widget의 prop에 다른 Widget의 내부 동작을 암시하는 이름을 쓰지 않는다.
Widget은 "무엇을 해야 하는지" 알아서는 안 되며, 부모(page)가 콜백으로 의미를 부여한다.

```tsx
// ❌ Widget이 다른 Widget의 동작을 직접 제어
<ClientTable clearWorkplaceTable={refetchWorkplaces} />

// ✅ 의미 중립적인 성공 콜백
<ClientTable onSuccess={refetchWorkplaces} />
```

### 성공 콜백은 `onSuccess`로 통일

CRUD 폼 다이얼로그를 포함하는 테이블 Widget의 성공 콜백 prop은 `onSuccess?: () => void`로 통일한다.

```tsx
interface Props {
  onSuccess?: () => void; // 등록/수정/삭제 성공 시 부모가 원하는 동작 주입
}
```

Widget 내부의 `refetch`에서 `onSuccess`를 함께 호출한다.

```ts
const refetch = () => {
  dataRefetch();
  onSuccess?.();
};
```
