import { cn } from "@/lib/utils";

/**
 * 모달·드로어 뒤를 덮는 백드롭의 면 — 색·흐림·층위.
 *
 * 등장 방식만 표면마다 다르다: 가운데 모달은 `animate-in/out`, 가장자리에서 미끄러져 나오는
 * 드로어·시트는 `data-starting/ending-style` 트랜지션이다. 그래서 면만 여기서 한 번 정의하고
 * 애니메이션은 아래 두 상수가 붙인다.
 */
const BACKDROP_SURFACE_CLASS =
  "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs dark:bg-black/50";

/** 가운데 모달(FormDialog·ConfirmDialog·뷰어) 백드롭 */
export const DIALOG_BACKDROP_CLASS = cn(
  BACKDROP_SURFACE_CLASS,
  "duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
);

/** 가장자리 표면(Drawer·모바일 사이드바 시트) 백드롭 */
export const SLIDE_BACKDROP_CLASS = cn(
  BACKDROP_SURFACE_CLASS,
  "transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0",
  "motion-reduce:transition-none",
);
