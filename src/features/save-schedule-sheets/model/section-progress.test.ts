import { describe, expect, it } from "vitest";

import { getDefaultSheetForm } from "./types";
import type { AssignedPollutants } from "./measured-pollutants";
import { getProgressTone, getSectionProgress } from "./section-progress";

// 분모 판정의 기준은 **배정 여부**다 — 노출 판정(visiblePollutants)은 화면에만 쓰인다.
const assigned = (over: Partial<AssignedPollutants> = {}): AssignedPollutants => ({
  thc: false, nox: false, sox: false, ...over,
});

// 배출가스 분모 = 가스분석기 시작시간 1 + O₂·CO₂·CO 9 (+ THC 1) (+ NOx 3) (+ SOx 3)
describe("getSectionProgress — 배출가스 분모", () => {
  const sheet = getDefaultSheetForm("GAS");

  it("아무 항목도 배정되지 않으면 3성분과 시작시간만 센다", () => {
    expect(getSectionProgress(sheet, "exhaust", assigned()).total).toBe(10);
  });

  it("NOx 가 배정되면 회차 3칸이 분모에 더해진다", () => {
    expect(getSectionProgress(sheet, "exhaust", assigned({ nox: true })).total).toBe(13);
  });

  it("THC·NOx·SOx 가 모두 배정되면 17칸이 된다", () => {
    const all = assigned({ thc: true, nox: true, sox: true });
    expect(getSectionProgress(sheet, "exhaust", all).total).toBe(17);
  });

  it("배정되지 않은 항목의 입력값은 진행도에 반영되지 않는다", () => {
    const withNox = { ...sheet, exhaustGas: { ...sheet.exhaustGas, nox: ["1", "2", "3"] } };

    // 3성분 기본값 9칸은 항상 채워져 있고, 배정된 NOx 3칸이 분모·분자 양쪽에 더해진다
    expect(getSectionProgress(withNox, "exhaust", assigned({ nox: true })))
      .toEqual({ done: 12, total: 13 });
    // 배정되지 않았으면 양쪽 모두에서 빠진다
    expect(getSectionProgress(withNox, "exhaust", assigned()))
      .toEqual({ done: 9, total: 10 });
  });

  it("NOx·SOx 기본값이 비어 있어 새 기록지의 진행도를 부풀리지 않는다", () => {
    const all = assigned({ thc: true, nox: true, sox: true });
    // 채워진 것은 3성분 기본값 9칸뿐 — NOx·SOx 6칸과 THC 는 비어 있다
    expect(getSectionProgress(sheet, "exhaust", all)).toEqual({ done: 9, total: 17 });
  });
});

describe("getProgressTone", () => {
  it("손대지 않은 섹션은 neutral, 채우는 중이면 warning, 다 채우면 brand", () => {
    expect(getProgressTone({ done: 0, total: 10 })).toBe("neutral");
    expect(getProgressTone({ done: 3, total: 10 })).toBe("warning");
    expect(getProgressTone({ done: 10, total: 10 })).toBe("brand");
  });

  it("셀 대상이 없는 섹션은 완료로 본다", () => {
    expect(getProgressTone({ done: 0, total: 0 })).toBe("brand");
  });
});
