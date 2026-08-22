import { describe, expect, it } from "vitest";

import type { MeasurementSheet } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";

import { getChangedSheets, toSheetBaseline } from "./conflict";
import { fromSheet } from "./mapper";
import { applyRemoteSheets } from "./remote-sync";
import type { SheetForm } from "./types";

type ServerValues = { weightBefore?: number; gasAnalyzerStartTime?: string };

/** 서버 시트. 대조에 쓰는 category·version 과 블록별 구분값만 의미가 있다. */
const serverSheet = (
  category: MeasurementCategory, version: number | null, values: ServerValues = {},
): MeasurementSheet => ({
  category,
  version,
  weather: {
    pressure: null, weatherCondition: null, temperature: null, humidity: null,
    windDirection: null, windSpeed: null, pa: null,
  },
  moisture: {
    weight: { before: values.weightBefore ?? null, after: null },
    gasMeterTemperature: { in: null, out: null },
    dryGasVolume: { before: null, after: null },
    suctionVelocity: null, gasMeterGaugePressure: null,
    samplingStartTime: null, samplingEndTime: null,
    pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
  },
  exhaustGas: {
    o2Concentration: [], co2Concentration: [], coConcentration: [],
    noxConcentration: [], soxConcentration: [],
    gasAnalyzerStartTime: values.gasAnalyzerStartTime ?? null, thcAnalyzerStartTime: null,
    standardGasDensity: null, o2CorrectionFactor: null,
  },
  quantity: null,
  particle: null,
  samplingPoints: [],
  samples: [],
  samplingPointCnt: null,
  avgTm: null,
});

// 폼은 서버 스냅샷에서 출발한다(`snapshot.sheets.map(fromSheet)`). 픽스처도 같은 경로를 따라야
// "서버와 맞춰진 상태"가 정확히 재현된다 — 기본 폼으로 만들면 측정점 개수부터 서버와 어긋난다.
const myForm = (category: MeasurementCategory, version: number | null): SheetForm =>
  fromSheet(serverSheet(category, version));

const editMoisture = (sheet: SheetForm, weightBefore: string): SheetForm =>
  ({ ...sheet, moisture: { ...sheet.moisture, weightBefore } });

describe("applyRemoteSheets — 사수·부사수가 한 기록지를 나눠 입력하는 경우", () => {
  it("내가 입력 중인 섹션은 지키고 상대가 저장한 섹션만 받아들인다", () => {
    const synced = myForm("GAS", 1);
    const baseline = toSheetBaseline([synced]);
    // 사수가 수분량을 입력하는 사이 부사수가 배출가스를 저장했다.
    const mine = editMoisture(synced, "12.5");

    const result = applyRemoteSheets(
      [mine], baseline, [], [serverSheet("GAS", 2, { gasAnalyzerStartTime: "09:30" })],
    );

    expect(result.sheets[0].moisture.weightBefore).toBe("12.5");
    expect(result.sheets[0].exhaustGas.gasAnalyzerStartTime).toBe("09:30");
    expect(result.updatedSections).toEqual({ GAS: ["exhaust"] });
  });

  it("version 을 이어받아 이어서 저장해도 충돌하지 않는다", () => {
    const synced = myForm("GAS", 1);
    const mine = editMoisture(synced, "12.5");

    const result = applyRemoteSheets(
      [mine], toSheetBaseline([synced]), [], [serverSheet("GAS", 2)],
    );

    expect(result.sheets[0].version).toBe(2);
  });

  it("내 입력이 담긴 시트는 동기화 뒤에도 저장 대상으로 남는다", () => {
    const synced = myForm("GAS", 1);
    const mine = editMoisture(synced, "12.5");

    const result = applyRemoteSheets(
      [mine], toSheetBaseline([synced]), [], [serverSheet("GAS", 2, { gasAnalyzerStartTime: "09:30" })],
    );

    // 상대 블록의 기준선만 옮겨야 한다. 내 블록까지 옮기면 내 입력이 "안 바뀐 것"으로 잡혀 서버에 안 올라간다.
    expect(getChangedSheets(result.sheets, result.baseline)).toHaveLength(1);
  });

  it("상대가 저장했어도 내용이 그대로면 사용자에게 알리지 않는다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets([synced], toSheetBaseline([synced]), [], [serverSheet("GAS", 2)]);

    expect(result.touchedCategories).toEqual([]);
    expect(result.updatedSections).toEqual({});
  });

  it("내용이 그대로여도 올라간 version 은 이어받는다 — 안 그러면 다음 저장이 409로 막힌다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets([synced], toSheetBaseline([synced]), [], [serverSheet("GAS", 2)]);

    expect(result.changed).toBe(true);
    expect(result.sheets[0].version).toBe(2);
  });

  it("version 도 내용도 그대로면 폼을 건드리지 않는다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets([synced], toSheetBaseline([synced]), [], [serverSheet("GAS", 1)]);

    expect(result.changed).toBe(false);
  });
});

describe("applyRemoteSheets — 둘이 같은 항목을 고친 경우", () => {
  /** 사수와 부사수가 둘 다 수분량을 건드린 상황 — 자동 병합으로 풀 수 없는 유일한 경우다. */
  const bothEditedMoisture = () => {
    const synced = myForm("GAS", 1);
    return applyRemoteSheets(
      [editMoisture(synced, "내 입력")], toSheetBaseline([synced]), [],
      [serverSheet("GAS", 2, { weightBefore: 99 })],
    );
  };

  it("충돌한 기록지를 알린다", () => {
    expect(bothEditedMoisture().conflictingCategories).toEqual(["GAS"]);
  });

  it("내 입력은 화면에 그대로 남는다", () => {
    expect(bothEditedMoisture().sheets[0].moisture.weightBefore).toBe("내 입력");
  });

  it("version 을 이어받지 않는다 — 이어받으면 내 저장이 상대 입력을 말없이 덮어쓴다", () => {
    // 낙관적 락이 잡아내야 할 바로 그 경우다. 실시간 동기화가 안전망을 무력화해서는 안 된다.
    expect(bothEditedMoisture().sheets[0].version).toBe(1);
  });

  it("충돌하지 않은 기록지의 version 은 정상적으로 이어받는다", () => {
    const gas = myForm("GAS", 1);
    const dust = myForm("DUST", 1);
    const baseline = toSheetBaseline([gas, dust]);

    const result = applyRemoteSheets(
      [editMoisture(gas, "내 입력"), dust], baseline, [],
      [serverSheet("GAS", 2, { weightBefore: 99 }), serverSheet("DUST", 3)],
    );

    expect(result.sheets.find((s) => s.category === "GAS")?.version).toBe(1);
    expect(result.sheets.find((s) => s.category === "DUST")?.version).toBe(3);
  });

  it("상대가 다른 블록만 고쳤으면 충돌이 아니다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets(
      [editMoisture(synced, "내 입력")], toSheetBaseline([synced]), [],
      [serverSheet("GAS", 2, { gasAnalyzerStartTime: "09:30" })],
    );

    expect(result.conflictingCategories).toEqual([]);
    expect(result.sheets[0].version).toBe(2);
  });
});

describe("applyRemoteSheets — 기록지 추가·삭제", () => {
  it("상대가 추가한 기록지는 화면에도 나타난다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets(
      [synced], toSheetBaseline([synced]), [], [serverSheet("GAS", 1), serverSheet("DUST", 0)],
    );

    expect(result.sheets.map((sheet) => sheet.category)).toEqual(["GAS", "DUST"]);
    expect(result.touchedCategories).toContain("DUST");
  });

  it("내가 지우려고 표시해 둔 기록지는 되살리지 않는다", () => {
    const synced = myForm("GAS", 1);

    const result = applyRemoteSheets(
      [synced], toSheetBaseline([synced]),
      [{ category: "DUST", version: 0 }],
      [serverSheet("GAS", 1), serverSheet("DUST", 0)],
    );

    expect(result.sheets.map((sheet) => sheet.category)).toEqual(["GAS"]);
  });

  it("상대가 지운 기록지는 내 입력이 없을 때만 화면에서 내린다", () => {
    const synced = myForm("DUST", 1);

    const result = applyRemoteSheets([synced], toSheetBaseline([synced]), [], []);

    expect(result.sheets).toEqual([]);
    expect(result.baseline.DUST).toBeUndefined();
  });

  it("상대가 지웠어도 내가 입력 중이면 남겨 저장 시점의 충돌 안내에 맡긴다", () => {
    const synced = myForm("DUST", 1);
    const mine = editMoisture(synced, "12.5");

    const result = applyRemoteSheets([mine], toSheetBaseline([synced]), [], []);

    expect(result.sheets).toEqual([mine]);
  });

  it("아직 서버와 맞춰본 적 없는 신규 시트는 건드리지 않는다", () => {
    // 같은 카테고리를 둘이 각자 새로 만든 경우다. 판단은 저장 시점의 409 경로가 한다.
    const mine = myForm("GAS", null);

    const result = applyRemoteSheets([mine], {}, [], [serverSheet("GAS", 0)]);

    expect(result.sheets).toEqual([mine]);
  });
});
