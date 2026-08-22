import { describe, expect, it } from "vitest";

import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";

import { toItemGroups } from "./options";

const stackPollutant = (
  id: number,
  pollutantId: number,
  nameKr: string,
  cycle: StackPollutantListItem["pollutant"]["cycle"],
  allowance: string,
  oxygenApplicable = false,
): StackPollutantListItem => ({
  id,
  stackId: 1,
  pollutant: {
    id: pollutantId,
    code: nameKr,
    nameKr,
    nameEn: nameKr,
    cycle,
    allowance,
    oxygenApplicable,
  },
});

const snapshotItem = (
  pollutantId: number,
  nameKr: string,
  cycle: MeasurementItemSnapshot["cycle"],
  allowance: number,
  oxygenApplicable = false,
): MeasurementItemSnapshot => ({
  stackPollutantId: pollutantId * 100,
  pollutantId,
  code: nameKr,
  nameKr,
  nameEn: nameKr,
  field: "AIR",
  method: "FIELD_MEASUREMENT",
  phase: "GAS",
  equipment: "가스분석기",
  testMethod: "ES 01310",
  cycle,
  allowance,
  oxygenApplicable,
});

describe("toItemGroups", () => {
  it("측정주기를 정의 순서로 묶는다 — 원장의 등록 순서에 좌우되지 않는다", () => {
    const groups = toItemGroups(
      [
        stackPollutant(1, 1, "암모니아", "ANNUAL", "30 ppm"),
        stackPollutant(2, 2, "먼지", "MONTHLY", "30 mg/Sm³"),
      ],
      [],
    );

    expect(groups.map((group) => group.cycle)).toEqual(["MONTHLY", "ANNUAL"]);
  });

  it("계획에 포함된 항목은 원장이 아니라 측정 시점 허용기준을 보여준다", () => {
    const groups = toItemGroups(
      [stackPollutant(1, 1, "먼지", "MONTHLY", "50 mg/Sm³")],
      [snapshotItem(1, "먼지", "MONTHLY", 30)],
    );

    expect(groups[0].options[0].allowance).toBe("30");
  });

  it("원장에서 빠졌지만 계획에 남은 항목도 목록에 넣고 isRetired 로 표시한다", () => {
    const groups = toItemGroups(
      [stackPollutant(1, 1, "먼지", "MONTHLY", "30 mg/Sm³")],
      [snapshotItem(1, "먼지", "MONTHLY", 30), snapshotItem(9, "황산화물", "MONTHLY", 180)],
    );

    expect(groups[0].options.map((option) => [option.pollutantId, option.isRetired])).toEqual([
      [1, false],
      [9, true],
    ]);
  });

  it("계획에 포함된 항목은 원장이 아니라 측정 시점의 산소보정 적용 여부를 따른다", () => {
    const groups = toItemGroups(
      [stackPollutant(1, 1, "먼지", "MONTHLY", "50 mg/Sm³", false)],
      [snapshotItem(1, "먼지", "MONTHLY", 30, true)],
    );

    expect(groups[0].options[0].oxygenApplicable).toBe(true);
  });

  it("계획에 없는 항목은 원장의 산소보정 적용 여부를 쓴다", () => {
    const groups = toItemGroups(
      [stackPollutant(1, 1, "먼지", "MONTHLY", "50 mg/Sm³", true)],
      [],
    );

    expect(groups[0].options[0].oxygenApplicable).toBe(true);
  });

  it("허용기준이 비어 있으면 '-' 로 채운다", () => {
    const groups = toItemGroups([stackPollutant(1, 1, "먼지", "MONTHLY", "  ")], []);

    expect(groups[0].options[0].allowance).toBe("-");
  });
});
