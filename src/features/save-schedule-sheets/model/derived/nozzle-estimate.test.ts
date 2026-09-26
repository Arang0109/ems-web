import { describe, expect, it } from "vitest";

import type { SheetCalcExternals } from "@entities/schedule";

import { getNozzleMissingInputs } from "./nozzle-estimate";
import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";

const externals = (patch: Partial<SheetCalcExternals> = {}): SheetCalcExternals => ({
  stackName: "굴뚝", standardOxygen: 4, shape: "CIRCULAR", horizontalLength: 1, verticalLength: null,
  pitotCoefficients: [{ coefficient: 0.84, velocity: 10 }],
  deltaH: null,
  nozzleDiameters: [0.4, 0.6, 0.8],
  ...patch,
});

/** 노즐 산정에 필요한 칸을 전부 채운 입자상 기록지 */
const filledSheet = (): SheetForm => {
  const sheet = getDefaultSheetForm("DUST", 2);
  sheet.weather.pressure = "1013";
  Object.assign(sheet.moisture, {
    weightBefore: "100", weightAfter: "101.5", gasMeterTempIn: "20", gasMeterTempOut: "21",
    dryGasVolumeBefore: "0", dryGasVolumeAfter: "10", gasMeterGaugePressure: "5",
  });
  sheet.samplingPoints = sheet.samplingPoints.map((p) => ({
    ...p, Ts: "150", Pv: "3.2", Ps: "-5", inTm: "25", outTm: "26",
  }));
  return sheet;
};

const labelsOf = (sheet: SheetForm, ext = externals()) =>
  getNozzleMissingInputs(sheet, ext).map((g) => g.label);

describe("getNozzleMissingInputs", () => {
  it("필요한 칸이 다 있으면 비어 있다", () => {
    expect(getNozzleMissingInputs(filledSheet(), externals())).toEqual([]);
  });

  it("장비 스냅샷에 노즐경·피토관 계수가 없으면 측정장비로 묶인다 (이동할 섹션 없음)", () => {
    const groups = getNozzleMissingInputs(filledSheet(), externals({ nozzleDiameters: [], pitotCoefficients: [] }));

    expect(groups).toEqual([
      { section: null, label: "측정장비", items: ["노즐 장비의 노즐경", "피토관 계수"] },
    ]);
  });

  it("대기압이 비면 기상정보가 잡힌다", () => {
    const sheet = filledSheet();
    sheet.weather.pressure = "";

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "weather", label: "기상정보", items: ["대기압"] },
    ]);
  });

  it("수분량은 빠진 칸을 이름으로 짚는다 — 흡인 유속·채취 시각은 산정과 무관하다", () => {
    const sheet = filledSheet();
    sheet.moisture.weightAfter = "";
    sheet.moisture.gasMeterGaugePressure = "  ";
    sheet.moisture.suctionVelocity = "";

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "moisture", label: "수분량", items: ["흡습병 무게 - 후", "게이지압"] },
    ]);
  });

  it("배출가스는 성분이 통째로 비었을 때만 잡는다 — 회차 하나면 평균이 나온다", () => {
    const sheet = filledSheet();
    sheet.exhaustGas.co2 = ["", "", ""];
    sheet.exhaustGas.co = ["0", "", ""];

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "exhaust", label: "배출가스", items: ["CO₂ 농도 (1회 이상)"] },
    ]);
  });

  it("측정점은 지점별로 빠진 온도·동정압을 짚고, DGM 온도는 한 지점만 있으면 된다", () => {
    const sheet = filledSheet();
    sheet.samplingPoints[0] = { ...sheet.samplingPoints[0], Pv: "", Ps: "" };
    sheet.samplingPoints[1] = { ...sheet.samplingPoints[1], inTm: "" };

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "point", label: "측정점", items: ["1지점 동압·정압"] },
    ]);
  });

  it("어느 지점에도 DGM 온도가 없으면 잡는다", () => {
    const sheet = filledSheet();
    sheet.samplingPoints = sheet.samplingPoints.map((p) => ({ ...p, outTm: "" }));

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "point", label: "측정점", items: ["DGM 입구·출구온도 (한 지점 이상)"] },
    ]);
  });

  it("측정점이 하나도 없으면 그것부터 알린다", () => {
    const sheet = filledSheet();
    sheet.samplingPoints = [];

    expect(getNozzleMissingInputs(sheet, externals())).toEqual([
      { section: "point", label: "측정점", items: ["측정점 (1개 이상)"] },
    ]);
  });

  it("빈 기록지는 섹션 순서(기상 → 수분량 → 배출가스 → 측정점)대로 나온다", () => {
    const sheet = getDefaultSheetForm("DUST", 1);
    // 배출가스는 기본값(20.9·0·0)이 채워져 있어 빠지지 않는다
    expect(labelsOf(sheet)).toEqual(["기상정보", "수분량", "측정점"]);
  });
});
