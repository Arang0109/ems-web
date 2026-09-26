import { cn } from "@/lib/utils";

/**
 * 셀렉트 계열(Select·MultiSelect·SearchableSelectControl·FilterSelect)의 생김새.
 *
 * 검색형은 Base UI `combobox`, 필터 칩은 Base UI `select` 를 직접 조립하지만
 * **일반형과 픽셀이 같아야 한다.** 클래스 문자열을 복사하면 한쪽만 고쳐져 반드시 갈라지므로
 * 상수 하나에서만 나오게 한다. (shadcn `components/ui/select` 도 여기를 읽는다.)
 */

export const SELECT_TRIGGER_CLASS =
  "flex w-fit items-center justify-between gap-1.5 rounded-md border border-rule-dark bg-transparent py-2 pr-2 pl-2.5 text-body-3 whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/12 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 data-placeholder:text-muted-ink data-[size=default]:h-[38px] data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-rule-dark/30 dark:hover:bg-rule-dark/50 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/** 목록 팝업 — 부유 패널 어휘(`Popover`·`FilterPopover`)와 같은 면·테두리·그림자 */
export const SELECT_POPUP_CLASS = cn(
  "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin)",
  "overflow-x-hidden overflow-y-auto rounded-nav bg-surface text-ink shadow-panel ring-1 ring-rule",
  "duration-100 data-[align-trigger=true]:animate-none",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
  "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
  "data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2",
  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
);

/** 목록 한 줄 — 강조(키보드·호버)는 연한 브랜드 면 + 진한 브랜드 글자 */
export const SELECT_ITEM_CLASS = cn(
  "relative flex w-full cursor-default items-center gap-2 rounded-button py-1.5 pr-8 pl-2",
  "text-body-3 text-ink-soft outline-hidden select-none",
  "focus:bg-brand-soft focus:text-brand-dark focus:**:text-brand-dark",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
);
