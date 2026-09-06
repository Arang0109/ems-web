import { describe, expect, it } from "vitest";

import {
  MOISTURE_WEIGHT_GAIN_RANGE,
  checkMoistureWeightGain,
  describeMoistureWeightIssues,
  getMoistureWeightGain,
} from "./validator";
import { getDefaultMoistureForm, getDefaultSheetForm } from "./types";
import type { MoistureForm, SheetForm } from "./types";

const moisture = (before: string, after: string): MoistureForm => ({
  ...getDefaultMoistureForm(),
  weightBefore: before,
  weightAfter: after,
});

const sheetWith = (category: SheetForm["category"], before: string, after: string): SheetForm => ({
  ...getDefaultSheetForm(category, 1),
  moisture: moisture(before, after),
});

describe("getMoistureWeightGain", () => {
  it("후 − 전 이다", () => {
    expect(getMoistureWeightGain(moisture("12.20", "12.55"))).toBeCloseTo(0.35, 10);
  });

  it("전·후 중 하나라도 비어 있으면 null 이다", () => {
    expect(getMoistureWeightGain(moisture("12.20", ""))).toBeNull();
    expect(getMoistureWeightGain(moisture("", "12.55"))).toBeNull();
    expect(getMoistureWeightGain(moisture("", ""))).toBeNull();
  });
});

describe("checkMoistureWeightGain", () => {
  it("허용 범위 안이면 경고하지 않는다", () => {
    expect(checkMoistureWeightGain(moisture("12.20", "12.55"))).toBeNull();
  });

  it("경계값은 허용한다 — 부동소수 뺄셈 오차에 밀려나지 않는다", () => {
    // 12.35 − 12.25 = 0.09999999999999964 로 하한보다 작게 나오지만 법정 하한인 0.1g 채취다
    expect(getMoistureWeightGain(moisture("12.25", "12.35"))).toBeLessThan(
      MOISTURE_WEIGHT_GAIN_RANGE.min,
    );
    expect(checkMoistureWeightGain(moisture("12.25", "12.35"))).toBeNull();

    // 2.2 − 1.2 = 1.0000000000000002 로 상한을 넘게 나오지만 법정 상한인 1g 채취다
    expect(getMoistureWeightGain(moisture("1.2", "2.2"))).toBeGreaterThan(
      MOISTURE_WEIGHT_GAIN_RANGE.max,
    );
    expect(checkMoistureWeightGain(moisture("1.2", "2.2"))).toBeNull();

    expect(checkMoistureWeightGain(moisture("12.2", "12.3"))).toBeNull();
    expect(checkMoistureWeightGain(moisture("12.2", "13.2"))).toBeNull();
  });

  it("하한 미만이면 tooSmall 이다", () => {
    expect(checkMoistureWeightGain(moisture("12.20", "12.25"))).toBe("tooSmall");
  });

  it("상한 초과면 tooLarge 다", () => {
    expect(checkMoistureWeightGain(moisture("12.20", "13.55"))).toBe("tooLarge");
  });

  it("무게가 줄어든 경우(음수)도 하한 미만이다", () => {
    expect(checkMoistureWeightGain(moisture("12.55", "12.20"))).toBe("tooSmall");
  });

  it("아직 입력하지 않았으면 경고하지 않는다", () => {
    expect(checkMoistureWeightGain(getDefaultMoistureForm())).toBeNull();
  });
});

describe("describeMoistureWeightIssues", () => {
  it("범위를 벗어난 기록지가 없으면 물을 것이 없다", () => {
    const result = describeMoistureWeightIssues([sheetWith("GAS", "12.20", "12.55")]);

    expect(result.total).toBe(0);
    expect(result.description).toBe("");
  });

  it("활성 여부와 무관하게 모든 기록지를 훑는다", () => {
    const result = describeMoistureWeightIssues([
      sheetWith("GAS", "12.20", "12.55"),
      sheetWith("DUST", "12.20", "12.25"),
    ]);

    expect(result.total).toBe(1);
    expect(result.description).toContain("0.05g");
  });

  it("기록지마다 한 줄씩 쌓는다", () => {
    const result = describeMoistureWeightIssues([
      sheetWith("GAS", "12.20", "13.55"),
      sheetWith("DUST", "12.20", "12.25"),
    ]);

    expect(result.total).toBe(2);
    expect(result.description.split("\n")).toHaveLength(2);
  });

  it("뺄셈의 부동소수 잔여값을 그대로 노출하지 않는다", () => {
    const result = describeMoistureWeightIssues([sheetWith("GAS", "12.2", "12.25")]);

    expect(result.description).toContain("0.05g");
    expect(result.description).not.toContain("0.04999");
  });
});
