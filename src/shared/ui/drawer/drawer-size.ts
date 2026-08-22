/**
 * 가장자리 오버레이(Drawer)의 위치·크기·슬라이드 규약.
 *
 * `dialogs/dialog-size.ts` 와 같은 역할이며, side 별로 ① 고정 위치 ② 크기 ③ 맞닿는
 * 테두리 ④ 코너 ⑤ 진입·이탈 트랜지션을 한 벌로 묶는다.
 *
 * shadcn 잔재 `components/ui/sheet.tsx` 는 이것을 하나의 거대한 `data-[side=*]`
 * 셀렉터 체인으로 갖고 있는데, 그 형태는 호출부에서 덮어쓸 수가 없다 —
 * tailwind-merge 가 `data-*` 변형이 붙은 유틸을 충돌로 인식하지 않아 두 클래스가 모두 남는다.
 * side 를 키로 하는 레코드로 펴 두면 필요한 side 의 값만 정확히 고를 수 있다.
 */

export const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const;

export type DrawerSide = (typeof DRAWER_SIDES)[number];

/**
 * 백드롭.
 *
 * `components/ui/dialog.tsx` · `components/ui/sheet.tsx` · `dialogs/ConfirmDialog.tsx` 에
 * 같은 문자열이 이미 세 벌 있고 이것이 네 번째다. z-index 도 네 곳 모두 `z-50` 리터럴이다.
 * DESIGN-SYSTEM.md 의 "모달 폭·백드롭·z-index 토큰화" 항목이 가리키는 지점이므로,
 * 그 작업이 오면 네 곳을 함께 걷어낸다. 여기서는 최소한 이름을 붙여 둔다.
 */
export const DRAWER_BACKDROP_CLASS =
  "fixed inset-0 isolate z-50 bg-black/10 transition-opacity duration-200 " +
  "supports-backdrop-filter:backdrop-blur-xs " +
  "data-starting-style:opacity-0 data-ending-style:opacity-0 " +
  "motion-reduce:transition-none dark:bg-black/50";

/** 표면 — side 와 무관한 부분. 색·글씨·그림자는 `ConfirmDialog` 와 같은 팔레트 어휘를 쓴다. */
export const DRAWER_POPUP_CLASS =
  "fixed z-50 flex flex-col bg-surface text-ink shadow-panel outline-none " +
  "transition-transform duration-200 ease-out motion-reduce:transition-none";

/**
 * side 별 위치·크기·슬라이드.
 *
 * 슬라이드는 화면 밖(`translate-*-full`)에서 들어온다 — `sheet.tsx` 는 2.5rem 만 움직여
 * "살짝 밀려나는" 페이드에 가까운데, 가장자리에 붙는 표면은 끝까지 나가는 편이 자연스럽다.
 */
export const DRAWER_SIDE_CLASS: Record<DrawerSide, string> = {
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-dialog border-t border-rule " +
    "data-starting-style:translate-y-full data-ending-style:translate-y-full",
  top:
    "inset-x-0 top-0 max-h-[85dvh] rounded-b-dialog border-b border-rule " +
    "data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
  right:
    "inset-y-0 right-0 h-dvh w-full border-l border-rule sm:max-w-md " +
    "data-starting-style:translate-x-full data-ending-style:translate-x-full",
  left:
    "inset-y-0 left-0 h-dvh w-full border-r border-rule sm:max-w-md " +
    "data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
};

/**
 * 하단 붙임(`bottom`)일 때 마지막 영역에 주는 여백.
 *
 * `env()` 는 `viewport-fit=cover` 가 없으면 0 이라 현재는 폴백값으로 동작한다
 * (`FormDialogShell` 의 전체화면 푸터와 같은 처리).
 */
export const DRAWER_SAFE_AREA_CLASS = "pb-[max(0.75rem,env(safe-area-inset-bottom))]";
