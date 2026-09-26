/**
 * 기록지 하단 액션 바의 버튼 모양 — 피그마 MO 시안(아이콘 16px 위 · 라벨 13px 아래, 4등분).
 *
 * 모바일은 버튼 넷이 폭을 나눠 갖고 아이콘과 라벨을 두 줄로 쌓는다(엄지로 누르기 쉬운 큰 타일).
 * 데스크탑은 기존처럼 한 줄 버튼으로 돌아간다.
 * `relative` : 타임라인 개수 배지를 모바일에서 타일 모서리에 띄우기 위한 기준.
 */
export const ACTION_TILE_CLASS = [
  "relative h-auto min-w-0 flex-1 flex-col gap-0 px-3.25 pt-2 pb-2.25 text-body-3",
  "md:h-9 md:flex-none md:flex-row md:gap-1.5 md:px-3 md:py-0 md:text-body-4",
].join(" ");

/** 타일 안 아이콘 — 모바일 16px, 데스크탑 19px */
export const ACTION_TILE_ICON_CLASS = "size-4 md:size-4.75";

/**
 * 액션 바 자체 — 모서리 없이 화면 양옆 끝까지 닿게 레이아웃 좌우 여백(-mx-4 / md:-mx-7.5)을 넘어 깐다.
 */
export const ACTION_BAR_CLASS =
  "-mx-4 justify-center gap-1 rounded-none px-2 pt-2.25 pb-3 md:-mx-7.5 md:gap-2 md:px-7.5 md:py-3";
