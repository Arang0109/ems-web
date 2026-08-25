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
| `buttons/` | IconButton, BackButton(뒤로가기 — `PageLayout` 이 사용), DetailViewButton 등 버튼 컴포넌트 |
| `cards/` | Panel(카드 셸), SummaryCard(지표 타일), SummaryCardGroup(제목+타일 그리드) |
| `dialogs/` | `FormDialog`(폼 제출 모달), `StepFormDialog`(스텝 위저드 모달), `ConfirmProvider` + `useConfirm`(확인 다이얼로그), `useUnsavedChangesGuard`(미저장 이탈 방지). 앞의 둘은 비공개 `FormDialogShell` 위에 얹힌다. `DocumentViewerDialog`(고정폭 문서 뷰어)는 셸을 쓰지 않는다 — 아래 참조 |
| `drawer/` | `Drawer` — 화면 가장자리에서 밀려 들어오는 오버레이(모바일 하단 바텀시트 / 데스크탑 사이드). 폼 제출 표면이 아니다 — 아래 참조 |
| `feedback/` | EmptyText — 패널 안 한 줄 빈 상태·안내 문구 |
| `form/` | 폼 요소 — `InlineInput`, `InputGroup`, `Select`, `TextArea`, `Checkbox`, `HorizontalRadioGroup`, `DatePicker`, `DateRangePicker`, `FileInput`, `AddressInput`, `Search`, `FieldGroup`, `DetailRow`+`DetailGrid`(읽기 전용 상세 — 모바일 좌/우 행, 데스크탑 고정폭 라벨 열), `SectionTitle`, `UnitField`(라벨+단위+완료체크), `TimeField`(시각 입력 — 아래 참조), `NumericField`(숫자 입력 — 아래 참조), `CalcResultRow`(자동계산 행), `CalcResultGrid`(자동계산 결과 묶음 — 아래 참조). 테이블 필터 바는 `FilterSelect`(칩형 단일선택)와 `FilterPopover`(조건 묶음 + 적용/초기화). **`Input.tsx` 는 없다** — 단일 입력은 `InlineInput`/`InputGroup` 을 쓴다 |
| `layout/` | PageLayout(페이지 셸 — 뒤로가기+제목+액션+본문), StickyActionBar(긴 폼 하단 고정 액션 바) |
| `nav/` | `ChipNav`(가로 스크롤 pill 칩 — 섹션 바로가기), `StepNav`(스텝 위저드 인디케이터 — 번호·연결선·완료 상태) |
| `links/` | Link |
| `pagination/` | Pagination |
| `semantics/` | PageTitle 등 시맨틱 요소 |
| `skeletons/` | Skeleton(자리표시 원자), SkeletonPanel(패널 단위 로딩) |
| `table/` | TanStack Table 기반 공통 테이블. 아래 표 참조 |
| `sidebar/` | AppSidebar, SidebarNav, SidebarBrandHeader, SidebarUserFooter, SidebarMobileBar |
| `sortable/` | `SortableList`(세로 드래그 정렬 + 위/아래 이동), `DragHandle`. **`@dnd-kit/*` 을 직접 import 해도 되는 유일한 곳이다.** 아래 참조 |
| `theme/` | ThemeToggle (다크모드 전환. 색 토큰은 `app/index.css` 의 `.dark` — DESIGN-SYSTEM.md 참조) |
| `tooltip/` | `Tooltip`(말풍선 — 임의 트리거에 병합), `HelpTip`(라벨 옆 도움말 아이콘). 아래 참조 |
| `tabs/` | `Tabs` — 언더라인형 탭. 비활성 탭 본문은 기본적으로 **언마운트**되므로, 탭을 오가며 유지해야 할 입력 폼이 있으면 `keepMounted` 를 켠다 |
| `toasts/` | `toast` (`toast.success`, `toast.error`) — feature 훅의 사용자 피드백 |

### 드래그 정렬은 `SortableList` 를 쓴다

도메인을 모르는 껍데기다 — 항목 모양은 `renderItem(item, controls)` 이 그리고, 순서 저장은 호출부(feature 훅)가 한다.

```tsx
<SortableList
  items={items}                       // { id: number } 를 만족하는 배열
  onReorder={handleReorder}           // (from, to) — 배열 계산은 @shared/lib 의 moveItem 으로
  renderOverlay={(item) => <헤더만 축약한 미리보기 />}
  renderItem={(item, controls) => (
    <Card
      leading={<DragHandle handleProps={controls.handleProps} label="…" />}
      action={<>
        <IconButton disabled={controls.isFirst} onClick={controls.moveUp} … />
        <IconButton disabled={controls.isLast}  onClick={controls.moveDown} … />
      </>}
    />
  )}
/>
```

- **드래그 핸들은 필수다.** `controls.handleProps` 를 붙이지 않으면 아무것도 드래그되지 않는다.
  카드 전체를 드래그 대상으로 두면 모바일에서 페이지 스크롤이 막히기 때문에 의도적으로 그렇게 두었다.
  `DragHandle` 의 `touch-none` 이 터치 드래그의 핵심이며, 손잡이 밖으로 번지면 안 된다.
- **위/아래 버튼을 함께 노출한다.** 드래그만 두면 키보드·모바일 접근성이 떨어진다.
- 항목이 1개면 정렬 UI 자체를 감춘다 — 순위도 조작도 의미가 없다.
- 카드가 펼쳐진 아코디언처럼 클 수 있으므로 `renderOverlay` 로 **헤더만** 축약해 띄운다.

### 파괴적 액션은 `useConfirm` 을 거친다

삭제처럼 되돌릴 수 없는 액션은 실행 전 반드시 확인 단계를 둔다. `toast` 와 같은 구조로
`ConfirmProvider` 를 `app-provider` 에서 한 번 렌더하고, 호출부는 훅만 쓴다.

```ts
const confirm = useConfirm();

const handleDelete = async () => {
  if (!client) return;

  const isConfirmed = await confirm({
    title: '의뢰기관 삭제',
    description: `${client.name}을(를) 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
    confirmLabel: '삭제',
    tone: 'danger',
  });
  if (!isConfirmed) return;

  try { ... }
};
```

- 위치는 **feature 훅** — entity 레이어는 모달·토스트를 모른다
- `tone: 'danger'` 는 삭제 등 복구 불가 액션에만. 취소 버튼이 기본 포커스를 받는다
- 등록·수정 제출에는 확인창을 두지 않는다 (되돌리기 쉬움). 대신 `FormDialog` 가
  아래 3가지로 실수를 막는다

### `FormDialogShell` 의 실수 방지 장치

| 장치 | 동작 |
|------|------|
| 배경 클릭 차단 | `disablePointerDismissal`. Base UI 기본값은 "배경 클릭 시 닫힘"이라 명시적으로 끈다 |
| 미저장 이탈 확인 | 폼 안에서 `input` 이벤트가 났으면 ESC·닫기 전에 `useConfirm`. `Select` 처럼 `input` 을 내지 않는 컨트롤 때문에 판정이 부족하면 `isDirty` prop 으로 덮어쓴다 |
| 엔터 암묵적 제출 차단 | 입력란에서 엔터를 눌러도 제출되지 않는다. 제출은 버튼을 눌렀을 때만 — 클릭, 또는 버튼에 포커스를 둔 엔터·스페이스(둘 다 네이티브 click 을 낸다). `textarea` 의 줄바꿈은 유지된다 |

`FormDialog` 와 `StepFormDialog` 는 이 셸을 공유한다.
**새 모달 표면을 만들 때 이 3가지를 다시 구현하지 말고 셸을 조합할 것.**

> 엔터 제출 차단은 셸 안에서만이다. `SignInForm` 처럼 `<form>` 을 직접 쓰는
> 페이지형 폼은 브라우저 기본 동작(엔터 제출)을 그대로 둔다.

### 스텝 위저드 모달 — `StepFormDialog`

폼이 길어 한 화면에서 맥락을 잃을 때 단계로 나눈다. 좌우 슬라이드로 전환하고
헤더에 `StepNav`, 푸터에 이동 버튼이 붙는다.

| 규칙 | 이유 |
|------|------|
| 활성 인덱스는 `StepFormDialog` 가, **스텝 목록·검증은 feature 가** 소유한다 | 인덱스는 비즈니스 의미가 없는 UI 상태다. 반면 "어떤 스텝이 보이는가"는 도메인 규칙이다 |
| 조건부 스텝은 `hidden` 플래그가 아니라 **`steps` 배열에서 빼서** 표현한다 | `steps.length` 가 곧 보이는 스텝 수여야 인덱스 계산에 예외가 없다 |
| `validate` 는 **boolean 만 반환**하고 에러 상태 반영은 호출자가 그 안에서 한다 | shared 는 features 의 에러맵 형태를 알지 않는다 |
| `이전`·`다음`·`StepNav` 버튼은 반드시 `type="button"` | 아니면 암묵적 제출 버튼이 된다 |
| 비-마지막 스텝에는 submit 버튼을 두지 않는다 | 브라우저의 암묵적 제출 대상 자체가 사라져 엔터 가드와 이중 방어가 된다 |
| 비활성 스텝은 **마운트를 유지**하되 `inert` 로 탭 순서·AT 트리에서 뺀다 | 폼 값은 훅에 있지만 표의 가로 스크롤 위치·IME 조합은 DOM 에만 있다 |

스텝 이동은 `다음` 이 현재 스텝만 검증하고, 제출은 전체를 검증해 **첫 실패 스텝으로 이동**한다.
`StepNav` 클릭 이동은 앞뒤 모두 자유롭다 — 등록 폼이지 결제 플로우가 아니다.

`fullScreenOnMobile`(md 미만 전체화면)은 **여기서만 기본값 `true`** 다.
`FormDialog` 도 같은 prop 을 받지만 기본값이 `false` 라 켜는 호출부만 전체화면이 된다 —
좁은 화면에서 좌우 여백까지 빼앗기면 못 쓰게 되는 폼(입력 칸이 많거나 표를 품은 `size="lg"`·`"xl"` 폼)에 켠다.

### 가장자리 오버레이는 `Drawer` — 폼 모달과 갈래가 다르다

중앙 모달은 화면 한가운데를 덮어 뒤쪽 맥락을 끊는다. **뒤쪽 폼 값을 참조하면서 쓰는
보조 표면**(파생값 후보 목록, 필터, 참고 정보)은 가장자리에 붙이는 편이 낫다.
`Drawer` 가 그 셸이며, Base UI `dialog` 를 직접 쓴다(shadcn 래퍼 미경유).

| 상황 | 쓸 것 |
|------|-------|
| 제출이 있는 폼 | `FormDialog` / `StepFormDialog` — 실수 방지 장치 3종이 필요하다 |
| 뒤쪽 맥락을 남긴 채 고르거나 참조하는 표면 | `Drawer` |
| 고정폭 문서 뷰어 | `DocumentViewerDialog` |
| 트리거에 붙는 짧은 부유 패널 | `Popover` |

- **`FormDialogShell` 을 쓰지 않는다.** 미저장 이탈 확인·엔터 제출 차단은 **폼**의 장치다
  (`DocumentViewerDialog` 와 같은 근거). 그래서 **닫아서 잃을 값이 있는 표면에는 쓰지 말 것** —
  드로어 안의 입력은 호출부가 소유해 닫아도 남아 있어야 한다.
- **side 는 호출부가 정한다.** `useIsMobile()` 로 `bottom`(모바일) / `right`(데스크탑) 를 고르는
  것이 기본 조합이다. shared 는 화면 크기로 side 를 추측하지 않는다.
- **끌어내려 닫는 제스처는 없다.** 바텀시트의 그랩 핸들은 어포던스 표시일 뿐이며,
  Base UI dialog 에 제스처 계층이 없다(그건 `vaul` 의 영역이고 이 프로젝트는 도입하지 않는다).
- 크기·슬라이드·백드롭 클래스는 `drawer/drawer-size.ts` 가 단일 소스다.

### 고정폭 문서는 모달이 아니라 `DocumentViewerDialog` 로 띄운다

기록지·양식처럼 **폭이 고정된 문서**를 폼 모달에 넣으면 두 번 진다 — 헤더·푸터·여백이
문서 영역을 잘라먹고, 남은 폭에 문서가 안 들어가 가로 스크롤이 생긴다.
800px 짜리 23열 기록지는 휴대폰 폭에 맞추면 글씨가 5px 이라 **줄여 보여주는 것 자체가 답이 아니다.**

| 규칙 | 이유 |
|------|------|
| `FormDialogShell` 을 쓰지 않는다 | 미저장 이탈 확인·엔터 제출 차단은 **폼**의 장치다. 읽기 전용 문서는 배경 탭·ESC 로 바로 닫히는 편이 맞다 |
| 푸터를 두지 않는다 | 닫기는 헤더의 ✕ 하나면 된다. 버튼 줄 하나가 문서 세로 영역을 통째로 먹는다 |
| 문서 컴포넌트는 **좁은 화면에 맞춰 접거나 늘리지 않는다.** 최소 폭을 상수로 노출한다 (`REPORT_DOCUMENT_WIDTH` 등) | 표를 접으면 종이 기록지와 대조할 수가 없다. 축소는 뷰어의 배율이 맡는다 |
| 배율은 뷰어가 소유한다 | 기본 "폭 맞춤"(화면 회전을 따라감) + `−`/`+` 버튼 + 핀치·트랙패드 확대. 확대는 **화면 중앙을 기준**으로 스크롤을 되맞춘다 |

`documentWidth` 로는 문서의 **최소 폭**을 넘긴다. 폭 맞춤 배율의 분모는 뷰어가 `scrollWidth` 로
직접 재며, 이 값은 측정 전 첫 프레임의 폴백이자 하한이다 — **선언값을 분모로 믿으면 안 된다.**
문서가 선언값보다 넓게 그려지는 순간(표의 min-content 가 넘치는 경우가 흔하다) 남는 폭이 전부
한쪽으로만 생겨 문서가 가운데에서 밀려난다.

> 대신 **문서 안에 스크롤 컨테이너를 두지 않는다** — 실측이 그 안쪽 넘침을 보지 못해 폭이
> 조용히 선언값으로 되돌아간다.
헤더 우측 `toolbar` 슬롯에는 문서 전환처럼 뷰어를 닫지 않고 해야 하는 액션만 둔다.

### 시각 입력은 `<input type="time">` 이 아니라 `TimeField` 를 쓴다

네이티브 시각 위젯은 브라우저마다 다른 위젯(스피너·AM/PM·시계 버튼)을 붙여 폭·높이가
디자인 스펙에서 어긋나고, 표 셀처럼 좁은 칸에서는 열을 밀어낸다. 현장에서 쓰는
24시간 4자리 입력과도 맞지 않는다.

`TimeField` 는 텍스트 입력 위에 마스킹(`maskTimeInput`)과 확정(`normalizeTime`)을 얹은 대체 구현이다.

| 동작 | 내용 |
|------|------|
| 타이핑 | 숫자만 치면 콜론이 끼워진다 (`1430` → `14:30`). 포커스를 벗어나면 미완성 값이 확정된다 (`9` → `09:00`) |
| 키보드 | ↑/↓ 5 분, Shift+↑/↓ 1 분. 빈 칸이면 현재 시각에서 시작. `Alt`·`Ctrl` 이 얹히면 증감하지 않고 표의 셀 이동에 넘긴다 |
| 목록 | 시계 아이콘 → 시·분 팝오버(분은 5 분 간격 + 현재 값). `지금` 으로 현재 시각 |
| 값 계약 | `value`/`onChange` 는 확정된 `"HH:mm"` 과 `""` 뿐 — 타이핑 중인 미완성 값은 내부에만 있다 |

**`type="time"` 을 넘기면 `UnitField`·`InlineInput`·`TableInputCell` 이 알아서 `TimeField` 로 렌더한다.**
호출부는 바꿀 것이 없다. `frame="none"` 은 호스트가 테두리를 소유할 때 쓰는 내부 옵션이다.

### 숫자 입력도 `<input type="number">` 가 아니라 `NumericField` 를 쓴다

네이티브 숫자 입력은 **모바일 숫자 키패드에 `-` 키가 없다.** 기온·정압(Pₛ)·게이지압·진공게이지압처럼
음수가 정상값인 항목을 현장에서 입력할 방법이 아예 없다는 뜻이다.
게다가 제어 컴포넌트에서는 미완성 입력(`"-"`, `"12."`, `"1e"`)에 브라우저가 `e.target.value` 로
**빈 문자열**을 돌려줘 타이핑 도중 값이 지워진다 (`step={0.00001}` 인 흡입량 필드에서 특히 두드러진다).

`NumericField` 는 `type="text" inputMode="decimal"`(숫자 키패드 유지) 위에
마스킹(`maskNumericInput`)·확정(`normalizeNumericInput`)·부호 토글(`toggleNumericSign`)을 얹은 대체 구현이다.

| 동작 | 내용 |
|------|------|
| 부호 | 입력창 우측 **± 버튼**으로 뒤집는다. 빈 칸에서 눌러도 `-` 가 먼저 선다 |
| 타이핑 | 숫자·`-`·`.` 외는 버린다. 미완성 값(`"-"`·`"12."`)은 유지하고, 포커스를 벗어나면 확정된다 (`".5"` → `"0.5"`) |
| 키보드 | ↑/↓ 로 `step` 만큼 증감. 네이티브와 달리 **휠 스크롤로는 값이 바뀌지 않는다**. `Alt`·`Ctrl` 이 얹히면 증감하지 않고 표의 셀 이동에 넘긴다 |
| 값 계약 | `value`/`onChange` 는 확정된 숫자 문자열과 `""` — 미완성 값은 내부에만 있다. `toNumber`/`toNumberOrNull` 이 그대로 읽는다 |

**`type="number"` 를 넘기면 `UnitField`·`InlineInput`·`TableInputCell`·`InputGroup` 이 알아서 `NumericField` 로 렌더한다.**
호출부는 바꿀 것이 없다. 입력 요소를 직접 조립하는 호스트(`InputGroup`)는 컴포넌트 대신
동작 계층인 `useNumericInput` 훅을 쓴다.

> **음수 허용 여부는 `min` prop 이 정한다** — `min` 이 없거나 음수면 ± 버튼이 나오고,
> `min >= 0` 이면 버튼이 빠지고 `-` 입력도 받지 않는다.
> **음수가 성립하지 않는 항목(무게·부피·유량·농도·시간·율)에는 호출부에서 `min={0}` 을 명시할 것.**
> 안 그러면 의미 없는 ± 버튼이 붙는다. `max` 는 표시용일 뿐 값을 제한하지 않는다(범위 검증은 validator 몫).

### 읽기 전용 값에 `readOnly` 입력창을 쓰지 않는다

자동계산 결과에 입력 프레임을 씌우면 포커스가 잡혀 탭 순회에 걸리고(`disabled` 가 아니다),
테두리 때문에 고칠 수 있는 값으로 읽히며, 프레임 높이(48px) 때문에 폼이 불필요하게 길어진다.

| 상황 | 쓸 것 |
|------|-------|
| 입력 필드에 딸린 파생값 **1개** | `CalcResultRow` — `UnitField` 의 `helper` 슬롯에 넣는다 |
| 입력과 독립된 결과 **묶음 N개** | `CalcResultGrid` — 라벨 위/값 아래, 프레임 없음 |
| 행=항목·열=측정점인 전치 표 | `TableResultCell` (`@shared/ui/table`) |

```tsx
<CalcResultGrid
  title="자동계산"
  emptyText="지점별 측정값을 입력하면 유속·유량이 계산됩니다."
  items={[
    { label: '평균 유속 (Vs)', value: quantity?.Vs, unit: 'm/s', hint: PARTICLE_HINT.quantity },
    ...
  ]}
/>
```

- **원값을 그대로 넘긴다.** `value` 가 `number | string | null | undefined` 라
  `display()` 같은 포맷 헬퍼를 거치지 않는다. 없음 표기(`—`)는 컴포넌트가 소유한다.
- 값이 하나도 없으면 `emptyText` 한 줄로 축약한다 — 계산 전 화면에서 자리를 비운다.

### `Tooltip` 은 터치에서도 열린다

Base UI 툴팁의 hover 는 `mouseOnly` 라 **모바일에서는 눌러도 열리지 않는다.** 현장 입력 화면이
모바일 1순위인 이 프로젝트에서는 그대로 쓸 수 없으므로, `shared/ui/tooltip/Tooltip` 이
open 상태를 직접 소유하고 트리거 클릭으로 토글한다(hover·키보드 포커스는 Base UI 가 그대로 처리).

| 컴포넌트 | 용도 |
|----------|------|
| `Tooltip` | 말풍선 셸. `children` 으로 받은 요소에 트리거 동작을 **병합**한다(래퍼 DOM 없음) |
| `HelpTip` | 라벨 옆 도움말 아이콘(`CircleHelp`). 전문 용어·계산식 설명용 |

- 도움말 문구는 shared 가 아니라 **해당 feature 의 `model/*-hints.ts`** 에 둔다
  (예: `features/save-schedule-sheets/model/field-hints.ts`)
- 아이콘만 보이므로 `label` 로 **어떤 항목의 설명인지** 밝힌다. `UnitField` 는 라벨이 문자열이면
  자동으로 만들고, JSX 라벨(`O₂` 등)이면 `hintLabel` 로 받는다
- 같은 문구를 필드마다 반복하지 말 것 — 그룹 단위 안내는 `SubAccordion` 의 `action` 슬롯에 하나만 단다

**비즈니스 로직 코드에서 반드시 `@shared/ui/*`를 통해 사용할 것**
(`@/components/ui/*` 직접 import 금지 — shadcn/ui 원본 컴포넌트 파일 내에서만 허용)

### 셀에서 바로 편집하는 표는 `InputTable` 로 조립한다

행=레코드, 열=항목인 입력 표(분석 결과·가스상 채취 정보 등)는 표 마크업을 매번 쓰지 않는다.
열 선언 배열 하나가 머리·폭·입력 스펙을 전부 정하고, 호출부에는
"이 레코드의 어떤 값을 어떻게 받는가"만 남는다.

| `kind` | 셀 | 용도 |
|--------|-----|------|
| `label` | `TableLabelCell` (`th scope="row"`) | 행을 식별하는 이름 |
| `readonly` | `td` | 고칠 수 없는 원장 값 (참고용) |
| `input` | `TableInputCell` | 입력 칸. `type="number"`·`"time"` 은 `NumericField`·`TimeField` 로 렌더된다 |
| `select` | `TableSelectCell` | 정해진 값 중 하나를 고르는 칸(단위 등). 트리거가 버튼이라 `Alt+화살표` 이동에는 끼지 않는다 — 이동은 `Tab` 이 맡는다 |
| `result` | `TableResultCell` | 자동계산 결과 (회색 배경) |
| `action` | `td` | 행 삭제 등. `editable` 이 꺼지면 열째로 빠진다 |

- **`width` 는 필수다.** 합이 표의 `minWidth` 가 되어 좁은 폭에서 가로 스크롤을 만든다.
  호출부가 `TABLE_MIN_WIDTH` 를 손으로 더하던 자리를 대신한다.
- **모바일 표현은 맡지 않는다.** 칸이 적으면 카드에 펼치고 많으면 모달에서 고치는 식으로
  화면마다 답이 다르다. 호출부가 `className="hidden md:block"` 으로 이 표를 데스크탑에만 세우고
  좁은 폭은 따로 그린다 — 그래도 **입력 스펙 배열은 두 표현이 공유**해야 한다.
- 열이 데이터 개수만큼 늘어나는 **전치 표(행=항목, 열=측정점)는 이 조합기의 모양이 아니다.**
  `PointTable` 처럼 셀 부품을 직접 쓰고 `useGridNavigation` 만 따로 얹는다.

### 입력 표의 셀 이동은 `Alt+방향키` 다 — `useGridNavigation`

표를 감싸는 요소에 `onKeyDown` 하나를 펼치면 셀 간 키보드 이동이 붙는다.
`InputTable` 은 안에서 이미 쓰고 있고, 전치 표는 직접 얹는다.

```tsx
const gridNav = useGridNavigation();
<div {...gridNav} className="hidden overflow-x-auto md:block"><table>…</table></div>
```

| 키 | 동작 |
|----|------|
| `Alt+↑↓←→` | **상하좌우 칸** — 기본 이동. 좌우는 같은 행 안에서만 움직인다 |
| `Enter` / `Shift+Enter` | 아래/위 행의 같은 열 (한 열을 죽 훑어 내려가는 입력용) |
| `Tab` / `Shift+Tab` | 네이티브 그대로 — 행 끝에서 다음 행으로 감아 돈다 |
| `Ctrl+Home` / `Ctrl+End` | 표의 첫/마지막 칸 |

> **맨 화살표에는 이동을 얹지 않는다.** 입력 칸은 늘 편집 중이라 화살표에 이미 임자가 있다 —
> 좌우는 캐럿 이동, 상하는 `NumericField`·`TimeField` 의 값 증감이다. 여기에
> "캐럿이 끝에 닿았을 때만 이동" 같은 조건을 얹으면 같은 키가 상황따라 다르게 움직여 못 쓴다.
> 그래서 이동은 `Alt` 로 명확히 갈라 놓았다.

**입력 컴포넌트가 키를 소비할 때는 조합키를 확인할 것.** `useNumericInput`·`TimeField` 의
↑/↓ 증감은 `altKey`·`ctrlKey`·`metaKey` 가 눌리면 흘려보낸다 — 그래야 `Alt+↑/↓` 가
숫자·시각 칸에서도 이동으로 동작한다. 그 외에 필드가 소비한 키는 `preventDefault` 로 표시되고,
훅은 `defaultPrevented` 를 먼저 확인해 **필드 쪽 해석에 항상 양보**한다.

`Alt+←/→` 는 브라우저의 뒤로/앞으로 가기이므로, **표 끝이라 갈 곳이 없어도 기본 동작을 막는다.**
안 그러면 입력 중이던 폼을 떠난다.

좌표는 `tr.rowIndex`·`td.cellIndex` 라는 네이티브 속성에서 읽는다 — 셀에 `data-*` 표식을 달거나
입력마다 `ref` 를 배선하지 않아도 되고, 입력이 없는 행(에러 줄·그룹 머리)은 저절로 건너뛴다.
다만 **`rowSpan` 으로 세로 병합한 표는 열 계산이 어긋난다** (현재 그런 입력 표는 없다).

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
| `TableLabelCell`, `TableInputCell`, `TableSelectCell`, `TableResultCell` | 기록지형(문서형) 테이블 셀. `TableLabelCell` 은 `scope` 로 행 머리·열 머리를 겸한다 |
| `InputTable` | 행=레코드·열=항목인 입력 표의 **조합기** — 열 선언 배열로 조립하고 셀 간 키보드 이동이 붙는다. 위 참조 |

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
    ├── use-numeric-input.ts # 숫자 입력 동작 계층 (NumericField·InputGroup 이 공유)
    ├── use-grid-navigation.ts # 입력 표의 셀 간 키보드 이동 (InputTable·전치 표가 공유)
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

성격별 파일에 정의하고 `@shared/lib` 배럴 하나로만 노출한다 — **딥 임포트(`@shared/lib/format/...`)는 쓰지 않는다.**

| 디렉토리 | 파일 | 담는 것 |
|----------|------|---------|
| `format/` | `code.ts` | 자릿수 문자열(사업자번호·전화번호 등) 정규화·표시 |
| | `number.ts` | 숫자 값의 Form ↔ Domain 변환과 금액 표시 |
| | `numeric-input.ts` | `NumericField` 전용 타이핑 마스킹·확정 |
| | `time.ts` | 시각 변환·분 연산·`TimeField` 전용 마스킹 |
| | `date.ts` | 날짜 표시 포맷 |
| `date/` | `date-range.ts` | 날짜 **구간** 계산·비교 (표시 포맷이 아니다) |
| `string/` | `address.ts`, `trim-value.ts`, `josa.ts` | 문자열 결합·정리·조사 |
| `file/` | `file-size.ts`, `download-blob.ts`, `content-disposition.ts` | 파일 크기 표시·다운로드·헤더 파싱 |
| `array/` | `move-item.ts` | 배열 항목 위치 이동 (드래그 정렬·위/아래 버튼 공용) |

| 함수 | 출처 | 용도 |
|------|------|------|
| `formatBusinessNumber(s)` | `format/code` | `'2383248234'` → `'238-32-48234'` |
| `formatPhoneNumber(s)` | `format/code` | `'01012345678'` → `'010-1234-5678'` |
| `formatAddress(road, addr)` | `string/address` | 도로명+상세 주소 결합 |
| `formatDateTime(s)`, `formatDate(s)` | `format/date` | 날짜/시간 표시 포맷 |
| `formatMonthDay(s)` | `format/date` | `'8월 15일'` 형태 짧은 날짜 |
| `formatNumber(n, o?)` | `format/number` | 천 단위 구분 표시 포맷(금액 한정 아님). `o` 는 `{ minDecimals, maxDecimals }` — `minDecimals` 는 모자란 소수 자리를 `0` 으로 채우고, `maxDecimals` 를 생략하면 로케일 기본값 3자리에서 반올림된다 |
| `toKoreanAmount(n)` | `format/number` | 계약 금액 한글 병기 — `120000000` → `'금 일억이천만원'` |
| `formatTime(s)`, `unformatTime(s)` | `format/time` | 서버 `"HH:mm:ss"` ↔ 폼 값 `"HH:mm"` |
| `addMinutes(t, m)` | `format/time` | `"HH:mm"` + 분 (자정 순환). 파싱 불가 시 `null` |
| `maskTimeInput(s)`, `normalizeTime(s)` | `format/time` | 시각 타이핑 마스킹(`"1430"` → `"14:30"`) · 미완성 값 확정(`"9"` → `"09:00"`). `TimeField` 전용 |
| `maskNumericInput(s, o)`, `normalizeNumericInput(s)`, `toggleNumericSign(s)` | `format/numeric-input` | 숫자 타이핑 마스킹 · 미완성 값 확정(`".5"` → `"0.5"`) · 부호 뒤집기. `NumericField` 전용 (`unformatNumber` 는 부호·소수점을 지우므로 쓰지 말 것) |
| `formatFileSize(n)` | `file/file-size` | 바이트 → 표시 문자열 |
| `moveItem(list, from, to)` | `array/move-item` | 항목을 다른 위치로 옮긴 **새 배열**. 범위 밖 인덱스·제자리 이동은 순서를 유지 |
| `unformatNumber(s)` | `format/code` | `'010-1234-5678'` → `'01012345678'` (자릿수 코드 정규화, 결과 `string`) |
| `toNumber(s)`, `toNumberOrNull(s)` | `format/number` | Form 문자열 → `number`/`number \| null` 변환 |
| `toFormValue(n)` | `format/number` | 위 둘의 **역방향** — Domain(`number \| null`) → Form `string` |
| `toDateKey(d)` | `date/date-range` | `Date` → `'yyyy-MM-dd'` (구간 비교의 기준 표현) |
| `toPresetRange(preset, today)` | `date/date-range` | `today`·`week`·`month`·`around30` → `{ from, to }` |
| `isWithinDateRange(v, range)` | `date/date-range` | 날짜/ISO 문자열이 구간에 드는지 (경계 포함) |
| `isSameDateRange(a, b)`, `matchDateRangePreset(r, today)` | `date/date-range` | 구간 비교 · 프리셋 역판정(필터 칩 선택 표시) |
| `trimValue(s)` | `string/trim-value` | 앞뒤 공백 제거 |
| `withSubjectJosa(w)` | `string/josa` | 받침에 따라 주격 조사 `이/가` 를 붙인다 (한글이 아니면 `이(가)`) |
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
├── api-error.ts      # 상태 코드를 보존하는 ApiError + unwrap (409 구분이 필요한 엔드포인트 전용)
├── index.ts
└── mocks/
    ├── browser.ts    # MSW 브라우저 워커 설정
    ├── index.ts
    └── handlers/     # 14개 도메인 핸들러
        ├── index.ts            # 핸들러 통합 + on/off 마커
        ├── auth.ts             ├── member.ts
        ├── client.ts           ├── document.ts
        ├── contract.ts         ├── equipment.ts
        ├── dashboard.ts        ├── team.ts
        ├── stack.ts            ├── schedule.ts
        ├── stack-pollutant.ts  ├── tenant.ts
        ├── pollutants.ts       └── pollutant-catalog.ts
```

### 에러는 문자열이지만, 409 는 예외다

`axiosPrivate` 인터셉터는 에러 응답을 `Promise.resolve` 로 되돌린다(401 refresh 재시도 흐름 때문).
그래서 엔티티 액션 훅은 `if (!result.status) throw new Error(result.message)` 로 **문자열 한 줄**만 얻고,
호출부는 실패를 toast 하나로 처리한다 — 대부분의 실패는 그걸로 충분하다.

**다르게 대응해야 하는 실패**(동시 편집 충돌 409 — 재시도해도 풀리지 않고 사용자의 선택이 필요하다)는
상태 코드를 알아야 하므로 `unwrap(res)` 을 거쳐 `ApiError` 를 던진다.

```ts
// entities/schedule/api/api.ts — 이 계약을 쓰는 함수는 saveSheets·updateBasicInfo 둘뿐이다
saveSheets: async (id, body): Promise<ScheduleResponse> => {
  const res = await axiosPrivate.put<ApiResponseMessage<ScheduleResponse>>(`/schedules/${id}/sheets`, body);
  return unwrap(res);   // 실패면 ApiError(status, message) throw
},
```

전 API 를 한 번에 옮기지 않는 이유는 반환 타입(`ApiResponseMessage<T>` → `T`)이 바뀌어
모든 액션 훅을 함께 고쳐야 하기 때문이다. **필요한 엔드포인트만 옮긴다.**

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