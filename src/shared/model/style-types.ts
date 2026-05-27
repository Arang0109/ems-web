export type size = "sm" | "md" | "lg" | "xl";

export const SIZE_STYLES: Record<size, string> = {
  sm: "h-8  px-3 text-xs",    // 32px — 보조/컴팩트
  md: "h-9  px-4 text-sm",    // 36px — 기본 (가장 많이 씀)
  lg: "h-10 px-5 text-sm",    // 40px — 주요 액션
  xl: "h-12 px-6 text-base",  // 48px — 히어로/강조
};

