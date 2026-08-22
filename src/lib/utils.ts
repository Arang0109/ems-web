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

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": FONT_SIZES.map((size) => `text-${size}`),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
