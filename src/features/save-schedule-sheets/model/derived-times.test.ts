import { describe, expect, it } from "vitest";

import type { SheetCalcPreview } from "@entities/schedule";

import { getDefaultMoistureForm, getDefaultSamplingPointForm } from "./types";
import type { MoistureForm, SamplingPointForm } from "./types";
import {
  calcMoistureSamplingMinutes,
  calcParticleSamplingMinutes,
  getGasAnalyzerEndTime,
  getThcAnalyzerEndTime,
} from "./derived-times";

const point = (samplingTime: string): SamplingPointForm => ({
  ...getDefaultSamplingPointForm(),
  samplingTime,
});

const moisture = (suctionVelocity: string): MoistureForm => ({
  ...getDefaultMoistureForm(),
  suctionVelocity,
});

/** 수분 파생에 필요한 vm_g 만 담은 최소 미리보기 */
const previewWithVm = (vm_g: number | null): SheetCalcPreview =>
  ({ moisture: { vm_g } } as SheetCalcPreview);

describe("getGasAnalyzerEndTime / getThcAnalyzerEndTime", () => {
  it("가스분석기는 15분, THC 는 30분을 더한다", () => {
    expect(getGasAnalyzerEndTime("10:00")).toBe("10:15");
    expect(getThcAnalyzerEndTime("10:00")).toBe("10:30");
  });

  it("자정을 넘기면 순환한다", () => {
    expect(getGasAnalyzerEndTime("23:50")).toBe("00:05");
    expect(getThcAnalyzerEndTime("23:50")).toBe("00:20");
  });

  it("시작이 비면 null — 표시 대체값은 호출부가 정한다", () => {
    expect(getGasAnalyzerEndTime("")).toBeNull();
    expect(getThcAnalyzerEndTime("")).toBeNull();
  });
});

describe("calcParticleSamplingMinutes", () => {
  it("지점별 채취시간을 합산한다", () => {
    expect(calcParticleSamplingMinutes([point("30"), point("30")])).toBe(60);
  });

  it("빈 값은 0 으로 취급한다", () => {
    expect(calcParticleSamplingMinutes([point("30"), point(""), point("15")])).toBe(45);
  });

  it("지점이 없으면 0 이다", () => {
    expect(calcParticleSamplingMinutes([])).toBe(0);
  });
});

describe("calcMoistureSamplingMinutes", () => {
  it("흡입량 ÷ 흡인유속으로 채취시간(분)을 구한다", () => {
    expect(calcMoistureSamplingMinutes(moisture("2"), previewWithVm(60))).toBe(30);
  });

  it("흡인량이 아직 계산되지 않았으면 null", () => {
    expect(calcMoistureSamplingMinutes(moisture("2"), previewWithVm(null))).toBeNull();
    expect(calcMoistureSamplingMinutes(moisture("2"), null)).toBeNull();
  });

  it("흡인유속이 없거나 0 이면 null — 0 나눗셈을 막는다", () => {
    expect(calcMoistureSamplingMinutes(moisture(""), previewWithVm(60))).toBeNull();
    expect(calcMoistureSamplingMinutes(moisture("0"), previewWithVm(60))).toBeNull();
  });
});
