import { describe, expect, it } from "vitest";

import type { MeasurementItemSnapshot, MeasurementMethodSnapshot } from "@entities/schedule";
import type { PollutantPhase } from "@shared/model";

import {
  buildGasSampleGroups, getUnassignedGroups, getUnassignedGroupsFor, getUnresolvedItems, hydrateSheets,
  isGroupAllowedOn,
} from "./gaseous-rows";
import type { SheetForm } from "./types";
import { getDefaultSampleForm, getDefaultSheetForm } from "./types";

/**
 * 측정방법 사본 픽스처 — 기본 8종의 채취 단위를 그대로 옮긴 것이다.
 * 규칙은 이제 enum 이 아니라 이 사본의 `sampleGrouping`·`mergedSampleName` 에서 나온다.
 */
const METHOD: Record<string, MeasurementMethodSnapshot> = {
  DUST:                { methodId: 1, name: "먼지",     sampleGrouping: "NONE",     mergedSampleName: null,     samplingMinutes: null },
  HEAVY_METAL:         { methodId: 2, name: "중금속",   sampleGrouping: "NONE",     mergedSampleName: null,     samplingMinutes: null },
  MERCURY:             { methodId: 3, name: "수은",     sampleGrouping: "NONE",     mergedSampleName: null,     samplingMinutes: null },
  FIELD_MEASUREMENT:   { methodId: 4, name: "현장측정", sampleGrouping: "NONE",     mergedSampleName: null,     samplingMinutes: null },
  ABSORPTION_SOLUTION: { methodId: 5, name: "흡수액",   sampleGrouping: "PER_ITEM", mergedSampleName: null,     samplingMinutes: 40 },
  ADSORPTION_TUBE:     { methodId: 6, name: "흡착관",   sampleGrouping: "MERGED",   mergedSampleName: "VOCs-T", samplingMinutes: 30 },
  TEDLAR_BAG:          { methodId: 7, name: "테드라백", sampleGrouping: "PER_ITEM", mergedSampleName: null,     samplingMinutes: null },
  CARTRIDGE:           { methodId: 8, name: "카트리지", sampleGrouping: "MERGED",   mergedSampleName: "VOCs",   samplingMinutes: 30 },
};

const item = (
  pollutantId: number,
  nameKr: string,
  method: keyof typeof METHOD | MeasurementMethodSnapshot | null,
  phase: PollutantPhase | null,
  code: string | null = null,
): MeasurementItemSnapshot => ({
  stackPollutantId: pollutantId * 100,
  pollutantId,
  code,
  nameKr,
  nameEn: "",
  field: "AIR",
  method: typeof method === "string" ? METHOD[method] : method,
  phase,
  mode: null,
  equipment: "",
  testMethod: "",
  samplingMinutes: null,
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
      { key: "method:6", sampleName: "VOCs-T", pollutantIds: [1, 2], particulateSource: null },
      { key: "method:8", sampleName: "VOCs", pollutantIds: [3, 4], particulateSource: null },
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

  // phase 는 규칙이 아니다 — 입자상 시트에서 잡는 카트리지 항목(PAH)은 회사가 NONE 방법에 붙여 제외한다.
  it("입자상 항목이라도 phase 가 아니라 붙인 측정방법의 채취 단위를 따른다 (PAH)", () => {
    const particulateCartridge: MeasurementMethodSnapshot = {
      methodId: 42, name: "카트리지(입자상)", sampleGrouping: "NONE", mergedSampleName: null, samplingMinutes: null,
    };
    const groups = buildGasSampleGroups([
      item(7, "다환방향족탄화수소류", particulateCartridge, "PARTICLE"),
      item(8, "벤지딘", particulateCartridge, "PARTICLE"),
      item(9, "포름알데히드", "CARTRIDGE", "GAS"),
    ]);

    expect(groups).toEqual([
      { key: "method:8", sampleName: "VOCs", pollutantIds: [9], particulateSource: null },
    ]);
  });

  // 회사가 입자상 항목을 통칭 채취 방법에 붙이면 그대로 뭉친다 — 그 어긋남은 측정물질 폼이 경고하고, 여기서 뒤집지 않는다.
  it("입자상 항목을 통칭 채취 방법에 붙이면 회사 데이터대로 뭉친다", () => {
    const groups = buildGasSampleGroups([
      item(7, "다환방향족탄화수소류", "CARTRIDGE", "PARTICLE"),
      item(9, "포름알데히드", "CARTRIDGE", "GAS"),
    ]);

    expect(groups).toEqual([{ key: "method:8", sampleName: "VOCs", pollutantIds: [7, 9], particulateSource: null }]);
  });

  it("테드라백 항목은 흡수액처럼 항목마다 한 행씩 만든다", () => {
    const groups = buildGasSampleGroups([
      item(12, "이황화메틸", "TEDLAR_BAG", "GAS"),
      item(16, "황화수소", "TEDLAR_BAG", "GAS"),
    ]);

    expect(groups.map((g) => g.sampleName)).toEqual(["이황화메틸", "황화수소"]);
    expect(groups.map((g) => g.pollutantIds)).toEqual([[12], [16]]);
  });

  it("현장측정·수은·입자상 항목은 만들지 않는다", () => {
    const groups = buildGasSampleGroups([
      item(10, "질소산화물", "FIELD_MEASUREMENT", "GAS"),
      item(11, "수은화합물", "MERCURY", "GAS"),
      item(13, "먼지", "DUST", "PARTICLE"),
    ]);

    expect(groups).toEqual([]);
  });

  // 비소화합물은 입자상(중금속 여지)이면서 흡수액도 한다. 코드·phase 예외 대신 고객사가 항목별 채취
  // 측정방법을 붙여 표현하며, phase 가 PARTICLE 이어도 행이 생긴다.
  it("비소화합물은 입자상이어도 항목별 채취 측정방법을 붙이면 흡수액 행이 생긴다", () => {
    const groups = buildGasSampleGroups([
      item(20, "비소화합물", "ABSORPTION_SOLUTION", "PARTICLE", "AS"),
    ]);

    expect(groups.map((g) => [g.sampleName, g.pollutantIds])).toEqual([["비소화합물", [20]]]);
  });

  it("비소화합물을 중금속(가스상 표 없음) 측정방법에 두면 행을 만들지 않는다", () => {
    expect(buildGasSampleGroups([item(21, "비소화합물", "HEAVY_METAL", "PARTICLE", "AS")])).toEqual([]);
  });

  it("측정방법이 없는 항목은 자동으로 만들지 않고 안내 대상으로 남긴다", () => {
    const items = [
      item(14, "고객사 자체 물질", null, null),
      item(15, "벤젠", "ADSORPTION_TUBE", "GAS"),
    ];

    expect(buildGasSampleGroups(items).map((g) => g.pollutantIds)).toEqual([[15]]);
    expect(getUnresolvedItems(items).map((i) => i.pollutantId)).toEqual([14]);
  });

  it("phase 가 없어도 측정방법이 있으면 그 채취 단위대로 행을 만든다", () => {
    const items = [item(16, "구 스냅샷 물질", "ABSORPTION_SOLUTION", null)];

    expect(buildGasSampleGroups(items).map((g) => g.pollutantIds)).toEqual([[16]]);
    expect(getUnresolvedItems(items)).toEqual([]);
  });

  // 승격 이전 문서는 methodId 가 없다 — 이름이 같으면 같은 병이다.
  it("원장 연결키가 없는 구 문서는 측정방법 이름으로 묶는다", () => {
    const legacy: MeasurementMethodSnapshot = { ...METHOD.CARTRIDGE, methodId: null };
    const groups = buildGasSampleGroups([
      item(3, "포름알데히드", legacy, "GAS"),
      item(4, "아세트알데히드", legacy, "GAS"),
    ]);

    expect(groups).toEqual([
      { key: "method-name:카트리지", sampleName: "VOCs", pollutantIds: [3, 4], particulateSource: null },
    ]);
  });

  // 규칙이 데이터에서 나오므로 고객사가 만든 방법도 같은 경로로 뭉친다.
  it("고객사가 새로 만든 통칭 측정방법도 그 통칭명으로 묶는다", () => {
    const custom: MeasurementMethodSnapshot = {
      methodId: 42, name: "흡착관(저농도)", sampleGrouping: "MERGED", mergedSampleName: "VOCs-L", samplingMinutes: 60,
    };
    const groups = buildGasSampleGroups([
      item(1, "벤젠", custom, "GAS"),
      item(2, "톨루엔", custom, "GAS"),
    ]);

    expect(groups).toEqual([{ key: "method:42", sampleName: "VOCs-L", pollutantIds: [1, 2], particulateSource: null }]);
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

describe("등속흡인 그룹의 기록지 제한", () => {
  // 비소화합물 — 중금속 여지로 잡으면서 흡수액도 하는 항목. 측정방식은 카탈로그가 정한 HEAVY_METAL 이다.
  const arsenic = { ...item(5, "비소화합물", "ABSORPTION_SOLUTION", "PARTICLE", "AS"), mode: "HEAVY_METAL" as const };
  const groups = buildGasSampleGroups([
    item(1, "벤젠", "ADSORPTION_TUBE", "GAS"),
    arsenic,
  ]);
  const heavyMetalSheet = (samples: SheetForm["samples"]): SheetForm => ({
    ...getDefaultSheetForm("HEAVY_METAL"),
    samples,
  });

  it("등속흡인 항목의 그룹은 그 입자상 기록지 카테고리를 출처로 갖는다", () => {
    expect(groups.map((g) => g.particulateSource)).toEqual([null, "HEAVY_METAL"]);
  });

  it("비소화합물은 중금속 기록지에만 놓이고 정유량 그룹은 어디에나 놓인다", () => {
    const [vocs, as] = groups;

    expect(isGroupAllowedOn(as, "HEAVY_METAL")).toBe(true);
    expect(isGroupAllowedOn(as, "GAS")).toBe(false);
    expect(isGroupAllowedOn(as, "DUST")).toBe(false);
    expect(isGroupAllowedOn(vocs, "GAS")).toBe(true);
    expect(isGroupAllowedOn(vocs, "HEAVY_METAL")).toBe(true);
  });

  it("가스상 기록지가 먼저 와도 비소화합물은 건너뛰고 중금속 기록지에 채운다", () => {
    const [gas, heavyMetal] = hydrateSheets([sheetWith([]), heavyMetalSheet([])], groups);

    expect(gas.samples.map((s) => s.sampleName)).toEqual(["VOCs-T"]);
    expect(heavyMetal.samples.map((s) => s.sampleName)).toEqual(["비소화합물"]);
  });

  it("중금속 기록지가 없으면 비소화합물은 미배정으로 남는다", () => {
    const [gas] = hydrateSheets([sheetWith([])], groups);

    expect(gas.samples.map((s) => s.sampleName)).toEqual(["VOCs-T"]);
    expect(getUnassignedGroups(groups, [gas]).map((g) => g.sampleName)).toEqual(["비소화합물"]);
  });

  it("기록지별 미배정 목록은 그 기록지에 놓일 수 있는 것만 담는다", () => {
    const sheets = [sheetWith([]), heavyMetalSheet([])];

    expect(getUnassignedGroupsFor(groups, sheets, "GAS").map((g) => g.sampleName)).toEqual(["VOCs-T"]);
    expect(getUnassignedGroupsFor(groups, sheets, "HEAVY_METAL").map((g) => g.sampleName))
      .toEqual(["VOCs-T", "비소화합물"]);
  });
});
