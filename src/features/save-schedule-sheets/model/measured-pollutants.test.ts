import { describe, expect, it } from "vitest";

import type { MeasurementItemSnapshot } from "@entities/schedule";

import { getDefaultExhaustGasForm } from "./types";
import {
  getAssignedPollutants,
  getExhaustGasVisibility,
  hasSavedExhaustGasValue,
} from "./measured-pollutants";

/** code 가 null 인 항목 = 카탈로그 도입 이전 스냅샷·고객사 자체 물질 → 이름 폴백 경로 */
const item = (nameKr: string, nameEn: string, code: string | null = null): MeasurementItemSnapshot => ({
  stackPollutantId: 1,
  pollutantId: 1,
  code,
  nameKr,
  nameEn,
  field: "AIR",
  method: "FIELD_MEASUREMENT",
  phase: "GAS",
  equipment: "자동가스분석기",
  testMethod: "ES 01301.1",
  cycle: "QUARTERLY",
  allowance: null,
  oxygenApplicable: false,
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

describe("hasSavedExhaustGasValue", () => {
  it("기본 폼은 어느 항목도 값이 없다", () => {
    const form = getDefaultExhaustGasForm();
    expect(hasSavedExhaustGasValue(form, "thc")).toBe(false);
    expect(hasSavedExhaustGasValue(form, "nox")).toBe(false);
    expect(hasSavedExhaustGasValue(form, "sox")).toBe(false);
  });

  it("회차 중 하나라도 채워져 있으면 값이 있다고 본다", () => {
    const form = { ...getDefaultExhaustGasForm(), nox: ["", "12.5", ""] };
    expect(hasSavedExhaustGasValue(form, "nox")).toBe(true);
    expect(hasSavedExhaustGasValue(form, "sox")).toBe(false);
  });

  it("THC 는 분석기 시작시간으로 판정한다", () => {
    const form = { ...getDefaultExhaustGasForm(), thcAnalyzerStartTime: "09:30" };
    expect(hasSavedExhaustGasValue(form, "thc")).toBe(true);
  });
});

describe("getExhaustGasVisibility", () => {
  const none = { thc: false, nox: false, sox: false };

  it("배정되지 않았어도 기존 값이 있으면 노출한다", () => {
    const visibility = getExhaustGasVisibility(none, { ...none, sox: true });
    expect(visibility.sox).toBe(true);
  });

  it("기존 값이 없어도 배정돼 있으면 노출한다", () => {
    const visibility = getExhaustGasVisibility({ ...none, nox: true }, none);
    expect(visibility.nox).toBe(true);
  });

  it("배정도 기존 값도 없으면 숨긴다", () => {
    expect(getExhaustGasVisibility(none, none)).toEqual(none);
  });
});
