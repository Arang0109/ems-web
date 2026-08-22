import { describe, expect, it } from "vitest";

import {
  getDirtyBlocks, getUpdatedBlocks, mergeServerSheet, toBlockSnapshot, toUpdatedSections,
} from "./blocks";
import { getDefaultSheetForm } from "./types";
import type { SheetForm } from "./types";

const base = (version: number | null = 1): SheetForm => ({
  ...getDefaultSheetForm("GAS"),
  version,
});

/** 블록별로 구분 가능한 값을 심어 어느 쪽 값이 살아남았는지 확인할 수 있게 한다. */
const withMoisture = (sheet: SheetForm, weightBefore: string): SheetForm =>
  ({ ...sheet, moisture: { ...sheet.moisture, weightBefore } });

const withExhaust = (sheet: SheetForm, gasAnalyzerStartTime: string): SheetForm =>
  ({ ...sheet, exhaustGas: { ...sheet.exhaustGas, gasAnalyzerStartTime } });

describe("getDirtyBlocks", () => {
  it("기준선이 없으면 전 블록을 변경으로 본다 — 아직 서버에 없는 신규 시트다", () => {
    expect(getDirtyBlocks(base(null))).toEqual(
      ["weather", "moisture", "exhaustGas", "samplingPoints", "samples", "particle"],
    );
  });

  it("값이 바뀐 블록만 고른다", () => {
    const before = base();
    const after = withMoisture(before, "12.5");

    expect(getDirtyBlocks(after, toBlockSnapshot(before))).toEqual(["moisture"]);
  });

  it("바뀐 것이 없으면 빈 목록이다", () => {
    const sheet = base();

    expect(getDirtyBlocks(sheet, toBlockSnapshot(sheet))).toEqual([]);
  });
});

describe("mergeServerSheet", () => {
  it("내가 편집 중인 블록은 지키고 나머지는 서버 값을 따른다", () => {
    // 사수는 수분량을, 부사수는 배출가스를 입력하는 실제 상황.
    const mine = withMoisture(base(1), "내 입력");
    const server = withExhaust(base(2), "09:30");

    const merged = mergeServerSheet(mine, server, ["moisture"]);

    expect(merged.moisture.weightBefore).toBe("내 입력");
    expect(merged.exhaustGas.gasAnalyzerStartTime).toBe("09:30");
  });

  it("version 은 항상 서버 값을 따른다 — 이어서 저장할 때 낙관적 락에 걸리지 않아야 한다", () => {
    const merged = mergeServerSheet(base(1), base(7), ["moisture"]);

    expect(merged.version).toBe(7);
  });

  it("편집 중인 블록이 없으면 서버 시트를 그대로 받는다", () => {
    const server = withExhaust(base(2), "10:00");

    expect(mergeServerSheet(withMoisture(base(1), "낡은 값"), server, [])).toEqual(server);
  });
});

describe("getUpdatedBlocks", () => {
  it("내가 지켜낸 블록은 갱신으로 세지 않는다", () => {
    const mine = withMoisture(base(1), "내 입력");
    const server = withMoisture(withExhaust(base(2), "09:30"), "남의 입력");

    expect(getUpdatedBlocks(mine, server, ["moisture"])).toEqual(["exhaustGas"]);
  });

  it("값이 같은 블록은 갱신이 아니다", () => {
    expect(getUpdatedBlocks(base(1), base(2), [])).toEqual([]);
  });
});

describe("toUpdatedSections", () => {
  it("particle 블록은 측정점·여지 두 섹션에 걸친다", () => {
    expect(toUpdatedSections(["particle"])).toEqual(["point", "sample"]);
  });

  it("섹션이 겹치면 한 번만 담는다", () => {
    expect(toUpdatedSections(["samplingPoints", "particle"])).toEqual(["point", "sample"]);
  });
});
