import { describe, expect, it } from "vitest";

import type { SheetCalcPreview } from "@entities/schedule";

import {
  getDefaultBasicInfoForm,
  getDefaultSampleForm,
  getDefaultSamplingPointForm,
  getDefaultSheetForm,
} from "../types";
import type { SheetForm } from "../types";
import { buildSamplingTimeline } from "./sampling-timeline";
import { buildTemperatureTables, calcInOutAverage } from "./temperature-table";

const info = { ...getDefaultBasicInfoForm(), samplingStartedAt: "09:00", samplingEndedAt: "12:00" };

const build = (sheets: SheetForm[]) => {
  const timeline = buildSamplingTimeline({
    basicInfo: info,
    // 수분 구간은 흡입량(vm_g) ÷ 흡인유속으로 종료가 생긴다 — 20L ÷ 2L/min = 10분
    sheets: sheets.map((sheet) => ({ sheet, previewCalc: { moisture: { vm_g: 20 } } as SheetCalcPreview })),
  });
  return buildTemperatureTables(sheets, timeline.rows);
};

const dustSheet = (): SheetForm => ({
  ...getDefaultSheetForm("DUST"),
  particle: { ...getDefaultSheetForm("DUST").particle, samplingStartTime: "09:30" },
  samplingPoints: [
    { ...getDefaultSamplingPointForm(), samplingTime: "10", Ts: "150", inTm: "20", outTm: "22" },
    { ...getDefaultSamplingPointForm(), samplingTime: "20", Ts: "160", inTm: "21", outTm: "" },
  ],
});

describe("buildTemperatureTables", () => {
  it("측정점 표는 지점 채취시간을 누적한 구간과 DGM 평균을 적고, 값이 없는 칸은 뺀다", () => {
    const table = build([dustSheet()]).tables.find((t) => t.kind === "point")!;

    expect(table.columns).toEqual(["배출가스", "가스미터 온도"]);   // 임핀저는 전부 비어 빠진다
    expect(table.rows.map((row) => [row.label, row.timeText, row.values])).toEqual([
      ["지점 1", "09:30 ~ 09:40", [150, 21]],
      ["지점 2", "09:40 ~ 10:00", [160, null]],   // 출구가 비어 평균을 내지 않는다
    ]);
  });

  it("가스상 시료 표는 시료 구간을 쓰고, 종료 미상도 시각과 함께 남긴다", () => {
    const sheet: SheetForm = {
      ...getDefaultSheetForm("GAS"),
      samples: [
        {
          ...getDefaultSampleForm(), sampleName: "SOx", startTime: "09:10", endTime: "09:40",
          inTemperature: "25", outTemperature: "26",
        },
        {
          ...getDefaultSampleForm(), sampleName: "NOx", startTime: "09:20", endTime: "",
          inTemperature: "26", outTemperature: "26",
        },
        { ...getDefaultSampleForm(), sampleName: "시각없음", inTemperature: "27", outTemperature: "27" },
      ],
    };
    const table = build([sheet]).tables.find((t) => t.kind === "sample")!;

    expect(table.columns).toEqual(["가스미터 온도"]);
    expect(table.rows.map((row) => [row.label, row.timeText, row.values])).toEqual([
      ["SOx", "09:10 ~ 09:40", [25.5]],
      ["NOx", "09:20 ~ --:--", [26]],
    ]);
  });

  it("수분 가스미터 평균온도는 기록지끼리 같으면 한 줄, 다르면 기록지별 줄이다", () => {
    const withMoisture = (sheet: SheetForm, tempIn: string): SheetForm => ({
      ...sheet,
      moisture: {
        ...sheet.moisture, samplingStartTime: "09:05", suctionVelocity: "2", gasMeterTempIn: tempIn, gasMeterTempOut: "22",
      },
    });

    const same = build([withMoisture(dustSheet(), "20"), withMoisture(getDefaultSheetForm("GAS"), "20")]);
    const sameTable = same.tables.find((t) => t.kind === "moisture")!;
    expect(sameTable.columns).toEqual(["가스미터 온도"]);
    expect(sameTable.rows.map((row) => [row.timeText, row.values])).toEqual([["09:05 ~ 09:15", [21]]]);

    const split = build([withMoisture(dustSheet(), "20"), withMoisture(getDefaultSheetForm("GAS"), "24")]);
    expect(split.tables.find((t) => t.kind === "moisture")!.rows.map((row) => row.label)).toEqual(["먼지", "가스상"]);
  });

  it("수분 채취 시각이 없어도 평균온도가 나오면 표시하고, 수분량 계산처럼 소수 첫째 자리로 반올림한다", () => {
    const sheet: SheetForm = {
      ...getDefaultSheetForm("GAS"),
      moisture: { ...getDefaultSheetForm("GAS").moisture, gasMeterTempIn: "19.2", gasMeterTempOut: "21.1" },
    };
    const table = build([sheet]).tables.find((t) => t.kind === "moisture")!;

    expect(table.rows.map((row) => [row.label, row.timeText, row.values])).toEqual([
      ["수분 채취", "시각 미입력", [20.2]],
    ]);
  });

  it("입구·출구 중 하나라도 비면 평균을 내지 않는다 — 수분량 계산과 같은 조건", () => {
    const sheet: SheetForm = {
      ...getDefaultSheetForm("GAS"),
      moisture: { ...getDefaultSheetForm("GAS").moisture, samplingStartTime: "09:05", gasMeterTempIn: "19" },
    };
    expect(build([sheet]).tables.some((t) => t.kind === "moisture")).toBe(false);
  });

  it("대기온도는 같은 값끼리 합치고 출처를 붙인다", () => {
    const withTemp = (sheet: SheetForm, temperature: string): SheetForm => ({
      ...sheet,
      weather: { ...sheet.weather, temperature },
    });
    const { ambient } = build([
      withTemp(getDefaultSheetForm("DUST"), "18"),
      withTemp(getDefaultSheetForm("GAS"), "18"),
    ]);

    expect(ambient).toEqual([{ value: 18, sourceLabel: "공통" }]);
  });

});

describe("calcInOutAverage", () => {
  it("입·출구 평균을 소수 첫째 자리로 반올림하고, 하나라도 비면 null 이다", () => {
    expect(calcInOutAverage("20", "22")).toBe(21);
    expect(calcInOutAverage("19.2", "21.1")).toBe(20.2);
    expect(calcInOutAverage("20", "")).toBeNull();
    expect(calcInOutAverage("", "")).toBeNull();
  });
});
