# EMS Design System — 사용 규칙

측정대행 업무(EMS) 웹앱 `ems-web` 의 디자인 시스템이다. 화면을 만들 때 아래를 지킨다.

## 1. 감싸기 — Provider 없이는 스타일도 동작도 없다

여러 컴포넌트가 테마·라우터·확인 다이얼로그 컨텍스트를 읽는다. 앱 최상단을 이렇게 감싼다.

```tsx
import { ThemeProvider } from "next-themes";
import { MemoryRouter } from "react-router-dom";
import { ConfirmProvider, Toaster } from "ems-web";

<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  <MemoryRouter>
    <ConfirmProvider>
      {children}
      <Toaster position="top-right" richColors />
    </ConfirmProvider>
  </MemoryRouter>
</ThemeProvider>
```

- `ThemeProvider` 는 `attribute="class"` 여야 한다 — 다크 토큰이 `.dark` 클래스에 걸려 있다.
- `Link`, `BackButton`, `SidebarNav` 는 라우터 컨텍스트가 없으면 **던진다.**
- `ConfirmProvider` 가 없으면 `useConfirm` 을 쓰는 흐름이 죽는다.
- 사이드바를 쓰면 `SidebarProvider` 를 추가로 감싼다 — `AppSidebar`·`SidebarTrigger` 가 그 안에서만 동작한다.

## 2. 스타일 관용구 — Tailwind v4 유틸리티 + 의미 토큰

CSS-in-JS 도 CSS Modules 도 없다. 레이아웃 접착제는 Tailwind 유틸리티로 쓰고,
색·타이포·코너는 **아래 의미 토큰 이름만** 쓴다. `text-gray-500`·`bg-blue-600` 같은
Tailwind 팔레트 색은 이 시스템에 없다.

### 타이포그래피 — 한 클래스가 크기·행간·자간·굵기를 모두 적용한다

`font-*`·`leading-*`·`tracking-*` 를 덧붙일 필요가 없다.

| 클래스 | 크기/굵기 | 용도 |
|---|---|---|
| `text-display` | 32px / 700 | 페이지 인트로 |
| `text-h1` | 25px / 700 | 페이지 제목 |
| `text-h2` | 21px / 700 | 섹션 제목 |
| `text-h3` | 18px / 600 | 패널 제목 |
| `text-body-1` | 14px / 700 | 값·강조 본문 |
| `text-body-2` | 14px / 400 | 일반 본문 |
| `text-body-3` | 13px / 400 | 보조 문구 |
| `text-body-4` | 13px / 600 | 버튼·탭 라벨 |
| `text-label` | 12px / 600 | 폼 라벨·표 머리 |
| `text-caption` | 11px / 400 | 캡션·단위 |

### 색 — 역할 이름

| 토큰 | 유틸리티 예 | 뜻 |
|---|---|---|
| `brand-primary` / `brand-dark` / `brand-soft` | `bg-brand-primary` `text-brand-dark` `bg-brand-soft` | 브랜드 초록 (주요 행동·선택 상태) |
| `canvas` / `surface` | `bg-canvas` `bg-surface` | 페이지 바탕 / 카드 면 |
| `ink` / `ink-soft` / `muted-ink` | `text-ink` `text-ink-soft` `text-muted-ink` | 본문 / 보조 / 흐린 글자 |
| `rule` / `rule-dark` | `border-rule` `bg-rule-dark/20` | 구분선 / 표 머리 면 |
| `danger` / `danger-soft` | `text-danger` `bg-danger-soft` | 오류·삭제 |
| `warning` / `warning-ink` / `warning-soft` | `bg-warning` `text-warning-ink` | 확인 필요·미저장 |
| `info` / `info-ink` / `info-soft` | `bg-info-soft` `text-info-ink` | 진행 중 안내 |

### 코너·그림자 — 용도로 이름 붙였다

`rounded-button`(6px) · `rounded-nav`(8px) · `rounded-icon-tile`(10px) ·
`rounded-panel`(11px) · `rounded-dialog`(13px) · `rounded-full`(뱃지·아바타) ·
`shadow-panel`(카드 기본 입체감).
t-shirt 사이즈(`rounded-md` 등)는 shadcn 잔재용이므로 새 코드에서 쓰지 않는다.

### 간격

Tailwind 기본 4px 스케일 그대로다 (`gap-2`=8px, `p-3`=12px, `gap-4`=16px …). 별도 토큰이 없다.

> ⚠️ **이 시스템의 스타일시트는 ems-web 앱이 실제로 쓴 유틸리티의 스냅샷이다.**
> Tailwind v4 는 소스에 리터럴로 등장한 클래스만 생성하므로, 앱이 한 번도 쓰지 않은
> 유틸리티(`max-w-40`, `max-w-md`, 임의 값 `w-[37px]` 등)는 **조용히 아무 효과가 없다.**
> 흔히 쓰이는 것(`flex` `grid` `gap-1~6` `p-1~6` `items-center` `justify-between`
> `max-w-xs/sm` `w-full` `flex-col` `grid-cols-1~2` `md:grid-cols-2`)은 안전하다.
> **레이아웃을 유틸리티로 짜내기보다 아래 컴포넌트를 조합하는 쪽이 항상 안전하다.**

## 3. 진실이 있는 곳

- `styles.css` 와 그 `@import` 클로저(`_ds_bundle.css`, `fonts/fonts.css`) — 실제로 존재하는
  클래스·토큰의 전부. 색 값이나 클래스 존재 여부가 궁금하면 여기를 읽는다.
- `components/<group>/<Name>/<Name>.d.ts` — props 계약.
- `components/<group>/<Name>/<Name>.prompt.md` — 컴포넌트별 사용 설명.
- `guidelines/DESIGN-SYSTEM.md` — 토큰이 왜 그렇게 정해졌는지(피그마 대응 포함).

## 4. 조합 규칙 몇 가지

- **표**는 `BasicTable` 이 TanStack Table 인스턴스(`useReactTable` + `getCoreRowModel`)를 받는다.
  껍데기는 `TablePanel`(제목·검색·등록 버튼·하단 바), 페이지 이동은 `TablePagination`.
- **기록지형 표**(측정값 입력)는 `<table>` 안에 `TableLabelCell` / `TableInputCell` /
  `TableSelectCell` / `TableResultCell` 을 직접 놓거나 `InputTable` 로 선언한다.
- **읽기 전용 상세**는 `DetailGrid` + `DetailRow`. 값이 없으면 `"-"` 를 넘기면 흐리게 죽는다.
- **상태 표시**는 색만으로 구분하지 않는다 — `StatusDot`(점+텍스트) 또는 `Badge`(pill)를 쓰고
  `label` 을 반드시 채운다.
- **폼 모달**은 `FormDialog`(단계가 있으면 `StepFormDialog`). 취소·제출·삭제 버튼과
  미저장 이탈 경고는 셸이 맡으므로 직접 만들지 않는다.
- **버튼**은 화면당 핵심 행동 하나에만 `variant="default"`(브랜드 초록)를 쓰고,
  나머지는 `outline`. 파괴적 행동은 `destructive`.

## 5. 예시

```tsx
import { BasicTable, Button, Search, StatusDot, TablePanel } from "ems-web";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";

const col = createColumnHelper<Schedule>();
const columns = [
  col.accessor("workplace", { header: "사업장" }),
  col.accessor("stack", { header: "배출구" }),
  col.accessor("status", {
    header: "진행 상태",
    cell: (c) => <StatusDot tone="active" label={c.getValue()} />,
  }),
];

export const ScheduleList = ({ rows }: { rows: Schedule[] }) => {
  const [filter, setFilter] = useState("");
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">측정일정</h1>
      <TablePanel
        title="측정일정 목록"
        actions={
          <>
            <Search filter={filter} setFilter={setFilter} placeholder="사업장, 배출구 검색 ..." />
            <Button startIcon={Plus}>측정일정 등록</Button>
          </>
        }
      >
        <BasicTable table={table} mobileCard={false} />
      </TablePanel>
    </div>
  );
};
```
