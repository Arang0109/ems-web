export type size = "sm" | "md" | "lg" | "xl";

export const SIZE_STYLES: Record<size, string> = {
  sm: "h-8  px-3 text-xs",    // 32px — 보조/컴팩트
  md: "h-9  px-4 text-sm",    // 36px — 기본 (가장 많이 씀)
  lg: "h-10 px-5 text-sm",    // 40px — 주요 액션
  xl: "h-12 px-6 text-base",  // 48px — 히어로/강조
};

/**
 * 입력 칸 하나의 상태 색.
 *
 * shared 는 **왜** 그 색인지 모른다 — "이전 회차에서 불러온 값"·"검증 실패" 같은 의미는
 * 호출부(feature)가 판단해 톤으로만 넘긴다.
 *
 * - `info`   : 안내 — 값은 들어 있으나 확인이 필요하다
 * - `danger` : 오류 — 검증에 걸린 칸
 */
export type FieldTone = "default" | "info" | "danger";
