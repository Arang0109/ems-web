import { describe, expect, it } from "vitest";

import type { MeasurementItemSnapshot, SheetCalcPreview } from "@entities/schedule";
import type { MeasurementMode } from "@shared/model";

import {
  buildSampleRules, getIsokineticDisplay, getParticulateSource, getSampleEndTime, getSampleSamplingMinutes,
  isAllowedOnSheet, isIsokineticMode, isIsokineticSample, isLockedSampleField, particulateSourceOf,
} from "./sample-rules";
import type { SampleForm, SheetForm } from "./types";
import { getDefaultSampleForm, getDefaultSheetForm } from "./types";

/** 규칙에 필요한 세 필드만 담은 최소 항목 */
const item = (pollutantId: number, mode: MeasurementMode | null, samplingMinutes: number | null) =>
  ({ pollutantId, mode, samplingMinutes } as MeasurementItemSnapshot);

const ARSENIC = 31;   // HEAVY_METAL — 등속흡인
const SO2 = 32;       // GAS_SAMPLING 30분
const BAG = 33;       // 채취시간 미지정
const rules = buildSampleRules([
  item(ARSENIC, "HEAVY_METAL", null),
  item(SO2, "GAS_SAMPLING", 30),
  item(BAG, "GAS_SAMPLING", null),
]);

const sample = (pollutantIds: number[]): SampleForm => ({
  ...getDefaultSampleForm(),
  startTime: "09:00", endTime: "09:30", suctionQuantity: "99", samplingVolume: "999",
  pollutantIds,
});

/** 입자상 채취시각을 적은 기록지 */
const sheet = (category: SheetForm["category"]): SheetForm => ({
  ...getDefaultSheetForm(category),
  particle: { ...getDefaultSheetForm(category).particle, samplingStartTime: "10:00", samplingEndTime: "11:00" },
});

/** 파생에 필요한 입자상 집계만 담은 최소 미리보기 — Vm 0.12 m³ 를 60분 동안 */
const preview = (totalVm: number | null, totalSamplingTime: number | null): SheetCalcPreview =>
  ({ particle: { totalVm, totalSamplingTime } } as SheetCalcPreview);

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

describe("isIsokineticSample / isAllowedOnSheet / isLockedSampleField", () => {
  it("등속흡인 항목이 하나라도 담기면 등속흡인 행이다", () => {
    expect(isIsokineticSample([ARSENIC], rules)).toBe(true);
    expect(isIsokineticSample([SO2, ARSENIC], rules)).toBe(true);
    expect(getParticulateSource([SO2, ARSENIC], rules)).toBe("HEAVY_METAL");
    expect(isIsokineticSample([SO2], rules)).toBe(false);
    expect(isIsokineticSample([], rules)).toBe(false);
  });

  it("규칙에 없는 항목(수동 추가 행)은 등속흡인이 아니다", () => {
    expect(isIsokineticSample([999], rules)).toBe(false);
  });

  it("등속흡인 행은 그 입자상 기록지에만, 정유량 행은 어디에나 놓인다", () => {
    expect(isAllowedOnSheet([ARSENIC], "HEAVY_METAL", rules)).toBe(true);
    expect(isAllowedOnSheet([ARSENIC], "GAS", rules)).toBe(false);
    expect(isAllowedOnSheet([SO2], "GAS", rules)).toBe(true);
    expect(isAllowedOnSheet([SO2], "DUST", rules)).toBe(true);
  });

  it("등속흡인 행은 시각·유량·채취량만 잠기고 나머지는 입력받는다", () => {
    expect(isLockedSampleField("startTime", [ARSENIC], rules)).toBe(true);
    expect(isLockedSampleField("endTime", [ARSENIC], rules)).toBe(true);
    expect(isLockedSampleField("suctionQuantity", [ARSENIC], rules)).toBe(true);
    expect(isLockedSampleField("samplingVolume", [ARSENIC], rules)).toBe(true);
    expect(isLockedSampleField("gasMeterGaugePressure", [ARSENIC], rules)).toBe(false);
    expect(isLockedSampleField("sampleNumber", [ARSENIC], rules)).toBe(false);
  });

  it("정유량 행은 아무 칸도 잠기지 않는다", () => {
    expect(isLockedSampleField("startTime", [SO2], rules)).toBe(false);
  });
});

describe("getSampleSamplingMinutes / getSampleEndTime", () => {
  it("시작시각에 표준 채취시간을 더한다", () => {
    expect(getSampleEndTime("09:10", [SO2], rules)).toBe("09:40");
  });

  it("한 병에 담긴 여러 항목은 처음 만나는 채취시간을 쓴다", () => {
    expect(getSampleSamplingMinutes([BAG, SO2], rules)).toBe(30);
    expect(getSampleEndTime("23:50", [BAG, SO2], rules)).toBe("00:20");
  });

  it("채취시간이 없으면 종료시각을 만들지 않는다", () => {
    expect(getSampleEndTime("09:10", [BAG], rules)).toBeNull();
    expect(getSampleEndTime("09:10", [], rules)).toBeNull();
  });

  it("시작이 비면 종료도 없다", () => {
    expect(getSampleEndTime("", [SO2], rules)).toBeNull();
  });

  it("등속흡인 행은 시각이 입자상 사본이라 만들지 않는다", () => {
    expect(getSampleEndTime("09:10", [ARSENIC], rules)).toBeNull();
  });
});

describe("getIsokineticDisplay", () => {
  it("등속흡인 행은 입자상 시각·Vm×1000·Vm×1000÷총채취시간을 보여 준다", () => {
    const display = getIsokineticDisplay(sample([ARSENIC]), sheet("HEAVY_METAL"), preview(0.12, 60), rules);

    expect(display).toEqual({ startTime: "10:00", endTime: "11:00", samplingVolume: "120", suctionQuantity: "2" });
  });

  it("행을 지웠다 다시 넣어 폼 값이 비어 있어도 같은 값이 보인다", () => {
    const blank: SampleForm = { ...getDefaultSampleForm(), pollutantIds: [ARSENIC] };

    expect(getIsokineticDisplay(blank, sheet("HEAVY_METAL"), preview(0.12, 60), rules)?.samplingVolume).toBe("120");
  });

  it("유량은 소수 둘째 자리로 반올림한다 (서버 Calculator.round 와 같다)", () => {
    const display = getIsokineticDisplay(sample([ARSENIC]), sheet("HEAVY_METAL"), preview(0.1, 60), rules);

    expect(display?.suctionQuantity).toBe("1.67");
    expect(display?.samplingVolume).toBe("100");
  });

  it("입자상 집계가 아직 없으면 시각만 보이고 유량·채취량은 빈 값이다", () => {
    const display = getIsokineticDisplay(sample([ARSENIC]), sheet("HEAVY_METAL"), null, rules);

    expect(display).toEqual({ startTime: "10:00", endTime: "11:00", samplingVolume: "", suctionQuantity: "" });
  });

  it("총채취시간이 0이면 유량은 빈 값이다", () => {
    expect(getIsokineticDisplay(sample([ARSENIC]), sheet("HEAVY_METAL"), preview(0.12, 0), rules)?.suctionQuantity)
      .toBe("");
  });

  it("정유량 행은 파생하지 않는다", () => {
    expect(getIsokineticDisplay(sample([SO2]), sheet("HEAVY_METAL"), preview(0.12, 60), rules)).toBeNull();
  });

  it("출처 기록지가 아닌 곳에 놓인 등속흡인 행은 파생하지 않는다", () => {
    expect(getIsokineticDisplay(sample([ARSENIC]), sheet("GAS"), preview(0.12, 60), rules)).toBeNull();
  });
});
