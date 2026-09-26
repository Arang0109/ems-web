import { describe, expect, it } from "vitest"

import { cn } from "./utils"

describe("cn — 커스텀 토큰 충돌 해소", () => {
  it("뒤에 온 반경이 앞의 커스텀 반경을 덮는다", () => {
    expect(cn("rounded-nav", "rounded-full")).toBe("rounded-full")
    expect(cn("rounded-button", "rounded-panel")).toBe("rounded-panel")
  })

  it("모서리 한 쪽만 덮는 반경은 함께 남는다", () => {
    expect(cn("rounded-panel", "rounded-t-none")).toBe("rounded-panel rounded-t-none")
  })

  it("커스텀 그림자는 그림자 크기로 분류된다 — 색과는 공존한다", () => {
    expect(cn("shadow-panel", "shadow-panel-strong")).toBe("shadow-panel-strong")
    expect(cn("shadow-panel", "shadow-lg")).toBe("shadow-lg")
    expect(cn("shadow-panel", "shadow-black")).toBe("shadow-panel shadow-black")
  })

  it("타이포 토큰과 글자색은 공존하고, 타이포끼리는 덮는다", () => {
    expect(cn("text-h3 text-ink", "text-h2")).toBe("text-ink text-h2")
  })
})
