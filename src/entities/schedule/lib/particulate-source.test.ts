import { describe, expect, it } from "vitest";

import { isIsokineticMode, particulateSourceOf } from "./particulate-source";

describe("particulateSourceOf / isIsokineticMode", () => {
  it("먼지·중금속·수은만 등속흡인이고 그 기록지가 출처다", () => {
    expect(particulateSourceOf("DUST")).toBe("DUST");
    expect(particulateSourceOf("HEAVY_METAL")).toBe("HEAVY_METAL");
    expect(particulateSourceOf("MERCURY")).toBe("MERCURY");
    expect(particulateSourceOf("GAS_SAMPLING")).toBeNull();
    expect(particulateSourceOf("DIRECT_READING")).toBeNull();
    expect(particulateSourceOf(null)).toBeNull();
    expect(isIsokineticMode("HEAVY_METAL")).toBe(true);
    expect(isIsokineticMode(null)).toBe(false);
  });
});
