import { describe, expect, it } from "vitest";

import type { SamplingItemSnapshot } from "../model/types";
import { getAssignedPollutants, isExhaustGasPollutant } from "./exhaust-gas-pollutants";

/** code 가 null 인 항목 = 카탈로그 도입 이전 스냅샷·고객사 자체 물질 → 이름 폴백 경로 */
const item = (nameKr: string, nameEn: string, code: string | null = null): SamplingItemSnapshot => ({
  stackPollutantId: 1,
  pollutantId: 1,
  code,
  nameKr,
  nameEn,
  field: "AIR",
  method: { methodId: 4, name: "현장측정", sampleGrouping: "NONE", mergedSampleName: null, samplingMinutes: null, suctionFlowRate: null },
  phase: "GAS",
  mode: "DIRECT_READING",
  equipment: "자동가스분석기",
  testMethod: "ES 01301.1",
  samplingMinutes: null,
  suctionFlowRate: null,
  cycle: "QUARTERLY",
  allowance: null,
  oxygenApplicable: false,
  analysis: null,
});

describe("isExhaustGasPollutant", () => {
  it("code 가 있으면 code 로만 판정한다", () => {
    expect(isExhaustGasPollutant(item("탄화수소(THC)", "", "THC"), "thc")).toBe(true);
    expect(isExhaustGasPollutant(item("총탄화수소", "THC", "NOX"), "thc")).toBe(false);
  });

  it("code 가 없으면 이름 별칭으로 폴백한다", () => {
    expect(isExhaustGasPollutant(item("총탄화수소", ""), "thc")).toBe(true);
    expect(isExhaustGasPollutant(item("", "Total Hydrocarbons"), "thc")).toBe(true);
    expect(isExhaustGasPollutant(item("일산화탄소", "Carbon Monoxide"), "thc")).toBe(false);
  });
});

describe("getAssignedPollutants", () => {
  it("측정항목이 없으면 전부 미배정이다", () => {
    expect(getAssignedPollutants([])).toEqual({ thc: false, nox: false, sox: false });
    expect(getAssignedPollutants(undefined)).toEqual({ thc: false, nox: false, sox: false });
  });

  it("카탈로그 code 로 잡는다", () => {
    expect(getAssignedPollutants([item("", "", "NOX")]).nox).toBe(true);
    expect(getAssignedPollutants([item("", "", "SOX")]).sox).toBe(true);
    expect(getAssignedPollutants([item("", "", "THC")]).thc).toBe(true);
  });

  // 고객사가 표기명을 바꿔 둬도 code 가 있으면 그것만 믿는다 — 이름 재판정은 오작동의 원인이다.
  it("code 가 있으면 이름이 달라도 code 를 따른다", () => {
    expect(getAssignedPollutants([item("우리회사 먼지", "our dust", "TSP")]))
      .toEqual({ thc: false, nox: false, sox: false });
    expect(getAssignedPollutants([item("사내 표기", "internal", "NOX")]).nox).toBe(true);
  });

  it("영문 약칭으로 잡는다 — code 가 없는 스냅샷의 폴백 경로", () => {
    expect(getAssignedPollutants([item("질소산화물", "NOx")]).nox).toBe(true);
  });

  it("영문 정식 명칭으로도 잡는다", () => {
    expect(getAssignedPollutants([item("질소산화물", "Nitrogen Oxides")]).nox).toBe(true);
    expect(getAssignedPollutants([item("황산화물", "Sulfur Oxides")]).sox).toBe(true);
  });

  it("한글명과 약칭을 괄호로 병기해도 잡는다", () => {
    expect(getAssignedPollutants([item("황산화물(SOx)", "")]).sox).toBe(true);
  });

  it("THC 는 약칭·한글명·영문명 어느 쪽으로도 잡는다", () => {
    expect(getAssignedPollutants([item("총탄화수소", "THC")]).thc).toBe(true);
    expect(getAssignedPollutants([item("총탄화수소", "Total Hydrocarbons")]).thc).toBe(true);
  });

  // 부분일치로 구현하면 "carbonmonoxide" 안의 "nox"(mo-nox-ide)에 걸려 NOx 로 오판한다.
  it("일산화탄소를 NOx 로 오판하지 않는다", () => {
    expect(getAssignedPollutants([item("일산화탄소", "Carbon Monoxide")]))
      .toEqual({ thc: false, nox: false, sox: false });
  });

  it("무관한 항목은 아무것도 켜지 않는다", () => {
    expect(getAssignedPollutants([item("먼지", "Dust")]))
      .toEqual({ thc: false, nox: false, sox: false });
  });

  it("공백·하이픈·언더바가 섞인 표기도 잡는다", () => {
    expect(getAssignedPollutants([item("", " N O x ")]).nox).toBe(true);
    expect(getAssignedPollutants([item("", "S-Ox")]).sox).toBe(true);
    expect(getAssignedPollutants([item("", "n_o_x")]).nox).toBe(true);
  });

  it("여러 항목 중 하나만 맞아도 켠다", () => {
    const assigned = getAssignedPollutants([
      item("먼지", "Dust"),
      item("질소산화물", "NOx"),
    ]);
    expect(assigned).toEqual({ thc: false, nox: true, sox: false });
  });
});
