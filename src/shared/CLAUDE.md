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
| `accordion/` | SectionAccordion(섹션 카드 + 진행도 배지), SubAccordion(중첩 그룹) |
| `borders/` | Divider 등 |
| `buttons/` | IconButton, DetailViewButton 등 버튼 컴포넌트 |
| `cards/` | Panel(카드 셸), SummaryCard(지표 타일), SummaryCardGroup(제목+타일 그리드) |
| `dialogs/` | FormDialog 등 |
| `feedback/` | EmptyText — 패널 안 한 줄 빈 상태·안내 문구 |
| `form/` | 폼 요소 — `InlineInput`, `InputGroup`, `Select`, `TextArea`, `Checkbox`, `HorizontalRadioGroup`, `DatePicker`, `DateRangePicker`, `FileInput`, `AddressInput`, `Search`, `FieldGroup`, `DetailRow`, `SectionTitle`, `UnitField`(라벨+단위+완료체크), `CalcResultRow`(자동계산 행). **`Input.tsx` 는 없다** — 단일 입력은 `InlineInput`/`InputGroup` 을 쓴다 |
| `layout/` | PageLayout(페이지 셸 — 제목+액션+본문), StickyActionBar(긴 폼 하단 고정 액션 바) |
| `nav/` | ChipNav — 가로 스크롤 pill 칩 (섹션 바로가기) |
| `links/` | Link |
| `pagination/` | Pagination |
| `semantics/` | PageTitle 등 시맨틱 요소 |
| `skeletons/` | Skeleton(자리표시 원자), SkeletonPanel(패널 단위 로딩) |
| `table/` | TanStack Table 기반 공통 테이블. 아래 표 참조 |
| `sidebar/` | AppSidebar, SidebarNav, SidebarBrandHeader, SidebarUserFooter, SidebarMobileBar |
| `theme/` | ThemeToggle (다크모드 전환 — 제거 예정, DESIGN-SYSTEM.md 참조) |
| `tabs/` | Tabs 등 탭 UI |
| `toasts/` | `toast` (`toast.success`, `toast.error`) — feature 훅의 사용자 피드백 |

**비즈니스 로직 코드에서 반드시 `@shared/ui/*`를 통해 사용할 것**
(`@/components/ui/*` 직접 import 금지 — shadcn/ui 원본 컴포넌트 파일 내에서만 허용)

### `ui/table/` 상세

| 파일 | 역할 |
|------|------|
| `BasicTable` | **조합기** — `useIsMobile` 로 md 미만이면 `MobileCardList`, 이상이면 `DesktopTable` |
| `DesktopTable` | 데스크탑 표 렌더링 (셀 타이포·정렬 아이콘 포함) |
| `MobileCardList` + `derive-card-config` | 모바일 카드 목록. 위젯의 `model/mobile-card.tsx` 선언을 소비 |
| `TablePanel` | 패널 셸 — 제목 + 액션 슬롯 + 본문 + footer 슬롯 |
| `TableFooterBar`, `TablePagination` | 건수 표시 + 페이지 이동 |
| `TableEmptyState` | 빈 상태 |
| `RowActionCell` | 행 상세보기 버튼. `table.options.meta.onViewDetail` 을 읽는다 |
| `SortIcon` | 정렬 방향 아이콘 |
| `TableLabelCell`, `TableInputCell`, `TableResultCell` | 기록지형(문서형) 테이블 셀 |

---

## `model/` — 공통 타입·훅

```
model/
├── index.ts
├── types/
│   ├── common-types.ts     # 도메인 전역 enum·union·Select 옵션
│   ├── api-types.ts        # ApiResponseMessage, FieldErrorResponse
│   ├── table-types.ts      # TanStack TableMeta 확장 선언, RowDetailHandler
│   ├── mobile-card-types.ts
│   └── style-types.ts
└── hooks/
    ├── use-mobile.ts       # useIsMobile — md 미만 감지
    ├── use-table-state.ts  # 정렬·필터·페이지네이션 state
    └── use-data-table.ts   # useTableState + useReactTable 배선 (테이블 위젯 표준)
```

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
  **및 Select 옵션 배열** (`measurementCycleOptions` 등) — feature 가 재정의하지 않는다
- `config/labels.ts` → 화면 표시 문자열 (예: `MEASUREMENT_CYCLE_LABEL`, `MEASUREMENT_FIELD_LABEL`)
- Feature → 위 옵션 배열을 그대로 사용
- Widget → 표시 라벨 변환

> **도메인 enum 을 entity 에 두지 않는 것이 이 프로젝트의 규약이다.** 여러 도메인이
> 공유하고 레이블·옵션까지 한 벌로 관리해야 하므로 shared 가 단일 소스다.
> (`shared` 금지 사항의 "도메인 전용 타입 금지"는 특정 슬라이스 전용 타입 — `ClientTableRow`,
> `ClientRegisterForm` 같은 것 — 을 뜻한다.)

---

## `config/constants.ts` — 공통 상수

| 상수 | 용도 |
|------|------|
| `TABLE_PAGE_SIZE` | 테이블 페이지 크기 3단계 (`COMPACT` 5 / `DEFAULT` 10 / `WIDE` 20). 위젯에서 매직넘버 금지 |
| `ERROR_MESSAGE` | 표준 에러 문구 (`FETCH`, `NETWORK`, `CREATE`, `UPDATE`, `DELETE`) |

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
| `formatMonthDay(s)` | `format/date-time` | `'8/9'` 형태 짧은 날짜 |
| `formatTime(s)`, `unformatTime(s)` | `format/time` | 서버 `"HH:mm:ss"` ↔ `<input type="time">` 값 `"HH:mm"` |
| `addMinutes(t, m)` | `format/time` | `"HH:mm"` + 분 (자정 순환). 파싱 불가 시 `null` |
| `formatFileSize(n)` | `format/file-size` | 바이트 → 표시 문자열 |
| `unformatNumber(s)` | `format/number` | `'010-1234-5678'` → `'01012345678'` (자릿수 코드 정규화, 결과 `string`) |
| `toNumber(s)`, `toNumberOrNull(s)` | `format/number` | Form 문자열 → `number`/`number \| null` 변환 |
| `toFormValue(n)` | `format/form-value` | 위 둘의 **역방향** — Domain(`number \| null`) → Form `string` |
| `trimValue(s)` | `string/trim-value` | 앞뒤 공백 제거 |
| `downloadBlob(blob, name)` | `file/download-blob` | 브라우저 다운로드 트리거 |
| `parseAttachmentFilename(h)` | `file/content-disposition` | `Content-Disposition` 에서 파일명 추출 |

- 입력 필드에서 실시간 포맷팅에 사용
- feature mapper에서 Form → Domain 변환 시 정규화·숫자 변환에 사용 (루트 `CLAUDE.md`의 "숫자 타입 처리 규칙" 참조)
- widget mapper에서 테이블 표시 포맷팅에 사용

---

## `api/` — HTTP 클라이언트

```
api/
├── axios-public.ts   # 인증 불필요 요청용 (로그인 등)
├── axios-private.ts  # 인증 토큰 필요 요청용 (자동 헤더 추가)
├── blob-error.ts     # blob 응답의 에러 본문 읽기 (readBlobErrorMessage)
├── index.ts
└── mocks/
    ├── browser.ts    # MSW 브라우저 워커 설정
    ├── index.ts
    └── handlers/     # 13개 도메인 핸들러
        ├── index.ts            # 핸들러 통합 + on/off 마커
        ├── auth.ts             ├── member.ts
        ├── client.ts           ├── document.ts
        ├── contract.ts         ├── equipment.ts
        ├── dashboard.ts        ├── team.ts
        ├── stack.ts            ├── schedule.ts
        ├── stack-pollutant.ts  ├── tenant.ts
        └── pollutants.ts
```

### 파일 다운로드 파이프라인

blob 응답은 일반 `ApiResponseMessage<T>` 계약 밖이라 별도 경로를 쓴다.

```
entities/*/model/use-xxx-download-action.ts   # AxiosResponse<Blob> 수신
  → shared/api/blob-error.ts                  # 실패 시 blob 본문에서 에러 메시지 추출
  → shared/lib/file/parse-attachment-filename  # Content-Disposition 파싱
  → shared/lib/file/download-blob              # 브라우저 다운로드 트리거 (호출부에서)
```

**엔티티는 DOM 을 만지지 않는다** — `{ blob, filename }` 만 반환하고 다운로드 트리거는 feature 가 한다.

새 도메인 MSW 핸들러는 `handlers/` 하위에 도메인별 파일로 분리하고 `handlers/index.ts`에 통합합니다.

### 핸들러 on/off 관리 (`handlers/index.ts`)

주석 방식으로 도메인별 활성화를 관리한다. 단순 주석 처리가 아닌 상태 마커로 맥락을 명시:

```ts
// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // [ACTIVE]   로그인(role 포함) — 관리자/플랫폼 운영자 콘솔 접근용
  ...authHandlers,

  // [READY]
  ...contractHandlers,

  // ... 나머지 도메인은 현재 전부 [ACTIVE]
];
```

실제 목록·마커는 `handlers/index.ts` 를 직접 확인한다 (이 문서에 중복 기재하지 않는다).

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