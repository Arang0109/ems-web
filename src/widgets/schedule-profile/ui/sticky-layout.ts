import { PAGE_STICKY_HEADER_OFFSET } from "@shared/ui/layout";

/**
 * 측정계획 상세의 모바일 상단 고정 영역 — 위에서부터 차례로 쌓인다.
 *
 *   페이지 헤더(제목줄 58 + 칩 줄 25 = 83px, `PageLayout stickyHeader`)
 *   → 탭 목록(48px)
 *   → 현장 채취 탭의 기록지 셀렉트 · 섹션 바로가기 바(61px)
 *
 * 각 층은 바로 위 층들의 높이만큼 `top` 을 내려 붙인다. 높이를 바꾸면 여기 숫자도 함께 고친다.
 * 데스크탑(md 이상)은 페이지 헤더·탭이 고정되지 않는다.
 */

/** 탭 목록 — 헤더 아래 고정, 높이 48px 로 고정 */
export const TAB_LIST_STICKY_CLASS = [
  "sticky z-20 h-12 -mx-4 bg-surface px-4 md:static md:h-auto md:mx-0 md:bg-transparent md:px-0",
  PAGE_STICKY_HEADER_OFFSET,
].join(" ");

/**
 * 탭 본문 첫머리의 고정 바 — 헤더 83 + 탭 48 = 131px 아래.
 * -mt-4 : 탭 본문의 윗여백(pt-4)을 상쇄해 탭 목록 바로 아래에 붙인다 (MO 시안).
 */
export const BELOW_TAB_LIST_STICKY_CLASS = "top-32.75 -mt-4 md:top-0 md:mt-0";

/** 바로가기로 이동한 섹션이 고정 영역(131 + 61px)에 가리지 않게 — 데스크탑은 바로가기 바만큼 */
export const SHEET_SECTION_SCROLL_MARGIN_CLASS =
  "[&_[id^=sheet-section-]]:scroll-mt-48 md:[&_[id^=sheet-section-]]:scroll-mt-16";
