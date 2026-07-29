# shared 레이어

비즈니스 도메인에 무관한 순수 재사용 유틸과 UI 기본 요소입니다.

---

## 책임 범위

- 공통 UI 컴포넌트 (shadcn/ui 래퍼 포함)
- axios 인스턴스 (인증/비인증)
- MSW 핸들러 및 Mock 데이터
- 공통 타입, enum, 상수
- 공통 레이블맵 및 옵션 생성 유틸
- 날짜, 숫자, 문자열 등 입력 포맷팅 유틸
- 범용 Helper 함수 및 재사용 가능한 Hook

## 금지 사항

- 비즈니스 도메인 로직 작성 금지
- 특정 feature/entity에 종속된 코드 금지
- 회사, 계약, 사업장 등 도메인 전용 타입 및 로직 작성 금지
- 상위 레이어를(entities, fetures, widgets, pages) import하지 말 것

## 판단 기준

- 위 질문에 "다른 프로젝트에서도 그대로 사용할 수 있는가?"라고 답할 수 있다면 shared에 위치시킨다.
- 그렇지 않고 특정 비즈니스 개념을 알고 있어야 한다면 해당 도메인(entities 또는 features)으로 이동한다.

---

## `ui/` — 공통 UI 컴포넌트

shadcn/ui를 래핑하거나 직접 작성한 공통 컴포넌트. 카테고리별 디렉토리 구조:

| 디렉토리 | 내용 |
|----------|------|
| `badges/` | Badge(pill), StatusDot(운영 상태 점+텍스트), tones |
| `primitives/` | shadcn/ui 에서 이관한 저수준 프리미티브 (Field, InputGroup, Table, Pagination, Calendar, Label, Textarea) — **비즈니스 코드에서 직접 쓰지 말 것**, 각 카테고리 래퍼 경유 |
| `borders/` | Divider 등 |
| `buttons/` | IconButton, DetailViewButton 등 버튼 컴포넌트 |
| `cards/` | SummaryCard 등 |
| `dialogs/` | FormDialog 등 |
| `form/` | Input, Select, DatePicker, Checkbox 등 폼 요소 |
| `links/` | Link |
| `pagination/` | Pagination |
| `semantics/` | PageTitle 등 시맨틱 요소 |
| `table/` | TanStack Table 기반 공통 테이블 (BasicTable, TableEmptyState) |
| `tabs/` | Tabs 등 탭 UI |
| `toasts/` | `toast` (`toast.success`, `toast.error`) — feature 훅의 사용자 피드백 |

**비즈니스 로직 코드에서 반드시 `@shared/ui/*`를 통해 사용할 것**
(`@/components/ui/*` 직접 import 금지 — shadcn/ui 원본 컴포넌트 파일 내에서만 허용)

---

## `model/types/common-types.ts` — 상수 + 타입 패턴

도메인 전역에서 사용하는 상수와 타입을 한 곳에서 관리한다.

```typescript
// 상수 배열 (as const → 유니온 타입 추론)
export const CONTRACT_STATUS = [
  'active',
  'expiringSoon',
  'expired',
] as const;

export type ContractStatus =
  (typeof CONTRACT_STATUS)[number];
```

---

## `config/labels.ts` — 표시 레이블 패턴

UI에서 사용하는 표시 문자열은 별도의 레이블맵으로 관리한다.

```typescript
export const CONTRACT_STATUS_LABEL: Record<
  ContractStatus,
  string
> = {
  active: '계약중',
  expiringSoon: '만료 예정',
  expired: '만료',
};
```

---

## 선택지 생성

폼에서 사용하는 Select 옵션은 타입과 레이블맵을 이용하여 생성한다.

```typescript
export const contractStatusOptions =
  CONTRACT_STATUS.map((value) => ({
    value,
    label: CONTRACT_STATUS_LABEL[value],
  }));
```

### 사용

- `model/types/common-types.ts` → 타입 및 상수 정의 (예: `MEASUREMENT_CYCLE` + `MeasurementCycle`)
- `config/labels.ts` → 화면 표시 문자열 (예: `MEASUREMENT_CYCLE_LABEL`, `MEASUREMENT_FIELD_LABEL`)
- Feature → Select 옵션 생성
- Widget → 표시 라벨 변환

---

## `lib/` — 포맷팅·변환 유틸 (`@shared/lib` 배럴로 노출)

`src/shared/lib/format/*`(도메인별 파일)와 `src/shared/lib/string/*`에 정의하고, `@shared/lib` 배럴에서 노출한다.

| 함수 | 출처 | 용도 |
|------|------|------|
| `formatBusinessNumber(s)` | `format/business-number` | `'2383248234'` → `'238-32-48234'` |
| `formatPhoneNumber(s)` | `format/phone-number` | `'01012345678'` → `'010-1234-5678'` |
| `formatAddress(road, addr)` | `format/address` | 도로명+상세 주소 결합 |
| `formatDateTime(s)` | `format/date-time` | 날짜/시간 표시 포맷 |
| `formatMoney(n)`, `toKoreanAmount(n)` | `format/money` | 금액 표시 포맷 |
| `unformatNumber(s)` | `format/number` | `'010-1234-5678'` → `'01012345678'` (자릿수 코드 정규화, 결과 `string`) |
| `toNumber(s)`, `toNumberOrNull(s)` | `format/number` | Form 문자열 → `number`/`number \| null` 변환 |
| `trimValue(s)` | `string/trim-value` | 앞뒤 공백 제거 |

- 입력 필드에서 실시간 포맷팅에 사용
- feature mapper에서 Form → Domain 변환 시 정규화·숫자 변환에 사용 (루트 `CLAUDE.md`의 "숫자 타입 처리 규칙" 참조)
- widget mapper에서 테이블 표시 포맷팅에 사용

---

## `api/` — HTTP 클라이언트

```
api/
├── axios-public.ts   # 인증 불필요 요청용 (로그인 등)
├── axios-private.ts  # 인증 토큰 필요 요청용 (자동 헤더 추가)
├── index.ts
└── mocks/
    ├── browser.ts    # MSW 브라우저 워커 설정
    └── handlers/
        ├── index.ts            # 핸들러 통합
        ├── auth.ts
        ├── client.ts           # 거래처(회사·사업장) 핸들러
        ├── contract.ts
        ├── dashboard.ts
        ├── stack.ts
        ├── stack-pollutant.ts
        └── pollutants.ts
```

새 도메인 MSW 핸들러는 `handlers/` 하위에 도메인별 파일로 분리하고 `handlers/index.ts`에 통합합니다.

### 핸들러 on/off 관리 (`handlers/index.ts`)

주석 방식으로 도메인별 활성화를 관리한다. 단순 주석 처리가 아닌 상태 마커로 맥락을 명시:

```ts
// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // [READY]    로그인 페이지 개발 시 활성화
  ...authHandlers,

  // [ACTIVE]
  ...dashboardHandlers,

  // [READY]
  ...clientHandlers,

  // [ACTIVE]
  ...stackHandlers,

  // [ACTIVE]
  ...stackPollutantHandlers,

  // [READY]
  ...contractHandlers,

  // [ACTIVE]
  ...pollutantHandlers,
];
```

백엔드 일부 API가 준비되는 시점에는 `VITE_MOCK_xxx=false` 환경변수 방식으로 전환을 검토한다.

### 목업 데이터 작성 기준

1. **필드명은 DTO와 완전히 일치** — `src/entities/[domain]/api/dto.ts` 응답 타입 기준
2. **필드값은 `common-types.ts` 상수 규격 사용** — `'AIR' | 'WATER' | 'NOISE_VIBRATION' | 'ODOR'`
3. **식별자 필드 누락 금지** — `id`, `workplaceId` 등 DTO에 있는 모든 필드 포함
4. **enum 필드 다양성 확보** — 가능한 모든 값을 최소 1건 이상 포함

### 경로 매칭 순서 주의

MSW는 등록 순서대로 매칭하므로, 구체적인 경로를 먼저 등록해야 한다:

```ts
// ✅ 올바른 순서
http.get('/workplaces/contract-summary', ...),
http.get('/workplaces', ...),

// ❌ 역순이면 /workplaces가 /workplaces/contract-summary를 가로챔
```