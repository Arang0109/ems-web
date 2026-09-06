import { describe, expect, it } from "vitest";

import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { MeasurementMethod, PollutantPhase } from "@shared/model";

import {
  buildGasSampleGroups, getUnassignedGroups, getUnresolvedItems, hydrateSheets,
} from "./gaseous-rows";
import type { SheetForm } from "./types";
import { getDefaultSampleForm, getDefaultSheetForm } from "./types";

const item = (
  pollutantId: number,
  nameKr: string,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
): MeasurementItemSnapshot => ({
  stackPollutantId: pollutantId * 100,
  pollutantId,
  code: null,
  nameKr,
  nameEn: "",
  field: "AIR",
  method,
  phase,
  equipment: "",
  testMethod: "",
  cycle: "SEMI_ANNUAL",
  allowance: null,
  oxygenApplicable: false,
  analysis: null,
});

const sheetWith = (samples: SheetForm["samples"]): SheetForm => ({
  ...getDefaultSheetForm("GAS"),
  samples,
});

const sample = (pollutantIds: number[], sampleName: string) => ({
  ...getDefaultSampleForm(),
  sampleName,
  pollutantIds,
});

describe("buildGasSampleGroups", () => {
  it("흡착관 항목을 VOCs-T 한 행으로, 카트리지 항목을 VOCs 한 행으로 묶는다", () => {
    const groups = buildGasSampleGroups([
      item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
      item(2, "톨루엔", "ADSORPTION_TUBE", "GAS"),
      item(3, "포름알데히드", "CARTRIDGE", "GAS"),
      item(4, "아세트알데히드", "CARTRIDGE", "GAS"),
    ]);

    expect(groups).toEqual([
      { key: "ADSORPTION_TUBE", sampleName: "VOCs-T", pollutantIds: [1, 2] },
      { key: "CARTRIDGE", sampleName: "VOCs", pollutantIds: [3, 4] },
    ]);
  });

  it("흡수액 항목은 한글 항목명으로 항목마다 한 행씩 만든다", () => {
    const groups = buildGasSampleGroups([
      item(5, "암모니아", "ABSORPTION_SOLUTION", "GAS"),
      item(6, "염화수소", "ABSORPTION_SOLUTION", "GAS"),
    ]);

    expect(groups.map((g) => [g.sampleName, g.pollutantIds])).toEqual([
      ["암모니아", [5]],
      ["염화수소", [6]],
    ]);
  });

  // 이 규칙의 유일한 함정 — method 를 먼저 보면 입자상 카트리지가 VOCs 로 뭉친다
  it("카트리지라도 입자상이면 VOCs 에 섞지 않는다 (PAH·벤지딘)", () => {
    const groups = buildGasSampleGroups([
      item(7, "다환방향족탄화수소류", "CARTRIDGE", "PARTICLE"),
      item(8, "벤지딘", "CARTRIDGE", "PARTICLE"),
      item(9, "포름알데히드", "CARTRIDGE", "GAS"),
    ]);

    expect(groups).toEqual([
      { key: "CARTRIDGE", sampleName: "VOCs", pollutantIds: [9] },
    ]);
  });

  it("현장측정·수은·테드라백·입자상 항목은 만들지 않는다", () => {
    const groups = buildGasSampleGroups([
      item(10, "질소산화물", "FIELD_MEASUREMENT", "GAS"),
      item(11, "수은화합물", "MERCURY", "GAS"),
      item(12, "자체물질", "TEDLAR_BAG", "GAS"),
      item(13, "먼지", "DUST", "PARTICLE"),
    ]);

    expect(groups).toEqual([]);
  });

  it("method·phase 가 없는 항목은 자동으로 만들지 않고 안내 대상으로 남긴다", () => {
    const items = [
      item(14, "고객사 자체 물질", null, null),
      item(15, "벤젠", "ADSORPTION_TUBE", "GAS"),
    ];

    expect(buildGasSampleGroups(items).map((g) => g.pollutantIds)).toEqual([[15]]);
    expect(getUnresolvedItems(items).map((i) => i.pollutantId)).toEqual([14]);
  });

  it("통칭 행을 그룹 첫 항목 자리에 놓아 측정항목 순서를 지킨다", () => {
    const groups = buildGasSampleGroups([
      item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
      item(2, "암모니아", "ABSORPTION_SOLUTION", "GAS"),
      item(3, "톨루엔", "ADSORPTION_TUBE", "GAS"),
    ]);

    expect(groups.map((g) => g.sampleName)).toEqual(["VOCs-T", "암모니아"]);
    expect(groups[0].pollutantIds).toEqual([1, 3]);
  });
});

describe("getUnassignedGroups", () => {
  const groups = buildGasSampleGroups([
    item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
    item(2, "암모니아", "ABSORPTION_SOLUTION", "GAS"),
  ]);

  it("기록지를 가로질러 판정한다 — 다른 기록지에 적혔으면 미배정이 아니다", () => {
    const sheets = [sheetWith([]), sheetWith([sample([1], "VOCs-T")])];

    expect(getUnassignedGroups(groups, sheets).map((g) => g.sampleName)).toEqual(["암모니아"]);
  });

  it("통칭 행을 쪼개 일부만 적어 두었어도 배정된 것으로 본다", () => {
    const merged = buildGasSampleGroups([
      item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
      item(3, "톨루엔", "ADSORPTION_TUBE", "GAS"),
    ]);

    expect(getUnassignedGroups(merged, [sheetWith([sample([1], "VOCs-T(1)")])])).toEqual([]);
  });

  it("링크 없는 수동 행은 배정으로 치지 않는다", () => {
    const sheets = [sheetWith([sample([], "직접 적은 항목")])];

    expect(getUnassignedGroups(groups, sheets)).toHaveLength(2);
  });
});

describe("hydrateSheets", () => {
  const groups = buildGasSampleGroups([
    item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
    item(2, "암모니아", "ABSORPTION_SOLUTION", "GAS"),
  ]);

  it("빈 표를 가진 첫 기록지에 전체를 채우고 다음 기록지는 비워 둔다", () => {
    const [first, second] = hydrateSheets([sheetWith([]), sheetWith([])], groups);

    expect(first.samples.map((s) => s.sampleName)).toEqual(["VOCs-T", "암모니아"]);
    expect(second.samples).toEqual([]);
  });

  it("행이 있는 기록지는 건드리지 않고 다음 빈 기록지에 남은 것을 채운다", () => {
    const existing = sheetWith([sample([1], "VOCs-T")]);
    const [first, second] = hydrateSheets([existing, sheetWith([])], groups);

    expect(first).toBe(existing);
    expect(second.samples.map((s) => s.sampleName)).toEqual(["암모니아"]);
  });

  it("채울 것이 없으면 원본을 그대로 돌려준다", () => {
    const sheets = [sheetWith([sample([1], "VOCs-T"), sample([2], "암모니아")])];

    expect(hydrateSheets(sheets, groups)).toBe(sheets);
  });
});
