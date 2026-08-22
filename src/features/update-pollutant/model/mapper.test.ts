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
  method: "FIELD_MEASUREMENT",
  phase: "GAS",
  equipment: "자동가스분석기",
  testMethod: "ES 01303.1",
};

describe("toPollutantUpdate", () => {
  it("고객사가 관리하는 값만 담는다", () => {
    expect(toPollutantUpdate(getDefaultForm(pollutant))).toEqual({
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
});
