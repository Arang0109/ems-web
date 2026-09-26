import { describe, expect, it } from "vitest";

import { calcGasAnalyzerEndTime, calcThcAnalyzerEndTime } from "./analyzer-times";

describe("calcGasAnalyzerEndTime / calcThcAnalyzerEndTime", () => {
  it("가스분석기는 15분, THC 는 30분을 더한다", () => {
    expect(calcGasAnalyzerEndTime("10:00")).toBe("10:15");
    expect(calcThcAnalyzerEndTime("10:00")).toBe("10:30");
  });

  it("자정을 넘기면 순환한다", () => {
    expect(calcGasAnalyzerEndTime("23:50")).toBe("00:05");
    expect(calcThcAnalyzerEndTime("23:50")).toBe("00:20");
  });

  it("시작이 비면 null — 표시 대체값은 호출부가 정한다", () => {
    expect(calcGasAnalyzerEndTime("")).toBeNull();
    expect(calcThcAnalyzerEndTime("")).toBeNull();
  });
});
