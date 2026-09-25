import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * src/app/index.css 의 --text-* 타이포 토큰.
 * tailwind-merge 는 Tailwind v4 CSS 테마를 읽지 못해 커스텀 text-* 를
 * text-color 그룹으로 오분류하므로(=색상 클래스와 충돌해 사라짐) 직접 등록한다.
 */
const FONT_SIZES = [
  "display",
  "h1",
  "h2",
  "h3",
  "body-1",
  "body-2",
  "body-3",
  "body-4",
  "label",
  "caption",
] as const

/**
 * src/app/index.css 의 --radius-* · --shadow-* 커스텀 토큰.
 * tailwind-merge 는 반경·그림자 테마로 t-shirt 이름(sm·md·lg…)만 알기 때문에,
 * 등록하지 않으면 `rounded-nav rounded-full` 이 둘 다 남고 `shadow-panel` 은 그림자 **색**으로 오분류된다.
 */
const RADII = ["row-action", "button", "nav", "icon-tile", "panel", "dialog", "bubble"] as const
const SHADOWS = ["panel", "panel-strong"] as const

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: [...RADII],
      shadow: [...SHADOWS],
    },
    classGroups: {
      "font-size": FONT_SIZES.map((size) => `text-${size}`),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
