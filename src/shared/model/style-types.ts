export type variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "sidebar"
  | "sidebarActive";

export const VARIANT_STYLES: Record<variant, string> = {
  primary:
    "bg-[#3B82F6]/90 text-white hover:bg-[#2770e7]",

  secondary:
    "bg-neutral-300/80 text-neutral-700 hover:bg-neutral-400/50",

  danger:
    "bg-[#FF4646]/80 text-white hover:bg-[#f52d2d]",

  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 shadow-none text-primary-600 hover:text-primary-700 font-medium",
    
  outline:
    "bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-100 shadow-none font-medium",

  sidebar:
    "text-gray-400 hover:bg-white/10 hover:text-white",
    
  sidebarActive:
    "text-white bg-white/10",
};

export type size = "sm" | "md" | "lg" | "xl";

export const SIZE_STYLES: Record<size, string> = {
  sm: "h-8  px-3 text-xs",    // 32px — 보조/컴팩트
  md: "h-9  px-4 text-sm",    // 36px — 기본 (가장 많이 씀)
  lg: "h-10 px-5 text-sm",    // 40px — 주요 액션
  xl: "h-12 px-6 text-base",  // 48px — 히어로/강조
};

export type width = "auto" | "full" | "left";

export const WIDTH_STYLES: Record<width, string> = {
    auto: "w-auto justify-center",
    full: "w-full justify-center",
    left: "w-full justify-start",
  };