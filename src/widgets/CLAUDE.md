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

### 패턴 A — 단순 위젯 (layouts, metrics, contract-chart 등)

```
widget-name/
├── index.ts
└── ComponentName.tsx   # ui/ 없이 루트에 위치 허용
```

### 패턴 B — 테이블 위젯 (client-table, workplace-table, stack-table, contract-table, pollutant-table, stack-list-table 등)

```
widget-name/
├── index.ts
├── model/
│   ├── types.ts            # TableRow 타입 정의
│   ├── columns.ts          # TanStack Table ColumnDef 정의
│   ├── mapper.ts           # Entity → TableRow 변환 함수
│   └── use-xxx-table.ts   # 테이블 상태 관리 훅
└── ui/
    ├── XxxTable.tsx        # 메인 테이블 컴포넌트 (렌더링만 담당)
    └── Cells.tsx           # 커스텀 셀 컴포넌트
```

### 패턴 C — 프로파일/상세 위젯 (stack-profile)

탭 또는 여러 상세 섹션으로 하나의 도메인 객체를 보여주는 위젯. 탭·섹션별 하위 컴포넌트를 `ui/children/`에 분리한다.

```
stack-profile/
├── index.ts
├── model/
│   ├── types.ts             # 프로파일 표시용 타입
│   ├── mapper.ts            # Entity(Detail) → 프로파일 표시 모델 변환
│   └── use-stack-profile.ts # 데이터 조합/상태 훅
└── ui/
    ├── StackProfile.tsx     # Tabs 조합 (측정시설/배출/방지/측정항목/측정이력)
    └── children/            # 탭별 서브 컴포넌트 (렌더링 단위)
        ├── StackBasicInfo.tsx
        ├── FacilityInfo.tsx
        ├── PreventionInfo.tsx
        └── MeasurementInfo.tsx   # register-stack-measurement feature 폼 조합
```

- 탭 컨테이너(`StackProfile.tsx`)는 `@shared/ui/tabs`의 `Tabs`로 구성하고, 각 탭 본문은 `ui/children/`의 서브 컴포넌트가 담당한다.
- 하위 탭이 feature(등록 폼 등)를 조합할 수 있다. 예: `MeasurementInfo.tsx` → `@features/register-stack-measurement`.

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

```typescript
export const useClientTable = ({ onRowClick }: Props) => {
  // 모달 상태
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // 테이블 상태 (정렬, 필터, 페이지네이션)
  const { sorting, setSorting, globalFilter, setGlobalFilter, pagination, setPagination } = useTableState({ pageSize: 5 });

  // 데이터 페칭
  const { data, loading, error, refetch } = useClients();

  // Entity → TableRow 변환
  const tableData = useMemo(() => data?.map(toClientRows), [data]);

  // TanStack Table 인스턴스
  const table = useReactTable({ columns: defaultColumns, data: tableData, ... });

  return { table, loading, error, refetch, globalFilter, setGlobalFilter, ... };
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
