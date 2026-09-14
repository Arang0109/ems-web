import { describe, it, expect } from "vitest";

import type { Pollutant } from "@entities/pollutant";

import { toPollutantUpdate } from "./mapper";
import { getDefaultForm } from "./types";

const pollutant: Pollutant = {
  id: 7,
  catalogId: 3,
  code: "NOX",
  field: "AIR",
  nameKr: "질소산화물",
  nameEn: "Nitrogen Oxides",
  methodId: 5,
  samplingMinutes: 60,
  methodName: "흡수액",
  sampleGrouping: "PER_ITEM",
  mergedSampleName: "",
  methodSamplingMinutes: 40,
  effectiveSamplingMinutes: 60,
  phase: "GAS",
  mode: "GAS_SAMPLING",
  equipment: "자동가스분석기",
  testMethod: "ES 01303.1",
};

describe("toPollutantUpdate", () => {
  it("고객사가 관리하는 값만 담는다", () => {
    expect(toPollutantUpdate(getDefaultForm(pollutant))).toEqual({
      methodId: 5,
      samplingMinutes: 60,
      nameKr: "질소산화물",
      nameEn: "Nitrogen Oxides",
      equipment: "자동가스분석기",
      testMethod: "ES 01303.1",
    });
  });

  it("고친 값이 그대로 실린다", () => {
    const form = { ...getDefaultForm(pollutant), testMethod: "ES 01303.2 (사내)" };

    expect(toPollutantUpdate(form).testMethod).toBe("ES 01303.2 (사내)");
  });

  it("앞뒤 공백을 정리한다", () => {
    const form = { ...getDefaultForm(pollutant), nameKr: "  질소산화물  " };

    expect(toPollutantUpdate(form).nameKr).toBe("질소산화물");
  });

  // 서버가 null 을 "기존 값 유지"로 읽으므로, 비운 항목이 지워지지 않는다.
  it("비운 항목은 null 로 보내 기존 값을 유지시킨다", () => {
    const form = { ...getDefaultForm(pollutant), equipment: "   " };

    expect(toPollutantUpdate(form).equipment).toBeNull();
  });

  it("한 번도 채우지 않은 값은 null 이다", () => {
    const blank: Pollutant = { ...pollutant, nameEn: "", equipment: "", testMethod: "" };
    const input = toPollutantUpdate(getDefaultForm(blank));

    expect(input.nameEn).toBeNull();
    expect(input.equipment).toBeNull();
    expect(input.testMethod).toBeNull();
  });

  it("측정방법을 고치면 id 가 숫자로 실린다", () => {
    const form = { ...getDefaultForm(pollutant), methodId: "8" };

    expect(toPollutantUpdate(form).methodId).toBe(8);
  });

  // 측정방법이 정해지지 않은 레거시 행은 비어 있다 — 미선택은 null 로 보내 서버가 기존 값을 유지하게 한다.
  it("측정방법을 고르지 않으면 null 이다", () => {
    const legacy: Pollutant = {
      ...pollutant, methodId: null, methodName: "", sampleGrouping: null, mergedSampleName: "",
      methodSamplingMinutes: null, effectiveSamplingMinutes: 60,
    };

    expect(toPollutantUpdate(getDefaultForm(legacy)).methodId).toBeNull();
  });

  // 서버가 samplingMinutes 만 전체 채택으로 읽는다 — 비운 칸은 오버라이드를 걷어 방법 표준값으로 되돌린다.
  it("항목 채취시간을 비우면 null 로 보내 방법 표준값으로 되돌린다", () => {
    const form = { ...getDefaultForm(pollutant), samplingMinutes: "" };

    expect(toPollutantUpdate(form).samplingMinutes).toBeNull();
  });

  it("오버라이드가 없는 항목은 빈 폼 값으로 시작한다", () => {
    const inherited: Pollutant = { ...pollutant, samplingMinutes: null, effectiveSamplingMinutes: 40 };

    expect(getDefaultForm(inherited).samplingMinutes).toBe("");
  });
});
