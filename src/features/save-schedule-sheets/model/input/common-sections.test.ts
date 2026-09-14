import { describe, expect, it } from "vitest";

import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import { copyCommonSections, findSyncSource, hasCommonSectionValues } from "./common-sections";

/** 앞 기록지 — 세 섹션과 측정점 2개(온도·동정압·채취시간)가 채워져 있다 */
const filled = (): SheetForm => {
  const sheet = getDefaultSheetForm("HEAVY_METAL", 2);
  return {
    ...sheet,
    weather: { ...sheet.weather, pressure: "1013.2", temperature: "18" },
    moisture: { ...sheet.moisture, weightBefore: "10", weightAfter: "15" },
    exhaustGas: { ...sheet.exhaustGas, o2: ["10", "10.2", "10.1"], gasAnalyzerStartTime: "09:00" },
    samplingPoints: sheet.samplingPoints.map((p, i) => ({
      ...p, Ts: `12${i}`, Pv: "5", Ps: "-2", inTm: `2${i}`, outTm: `3${i}`, samplingTime: "10", beforeVm: "50",
    })),
    particle: { ...sheet.particle, thimbleFilter: "T-1" },
  };
};

describe("copyCommonSections", () => {
  it("기상·수분·배출가스를 옮기고 시료·입자상은 그대로 둔다", () => {
    const target = { ...getDefaultSheetForm("GAS", 1), samples: [] };

    const copied = copyCommonSections(target, filled());

    expect(copied.weather.pressure).toBe("1013.2");
    expect(copied.moisture.weightAfter).toBe("15");
    expect(copied.exhaustGas.o2).toEqual(["10", "10.2", "10.1"]);
    expect(copied.exhaustGas.gasAnalyzerStartTime).toBe("09:00");
    expect(copied.category).toBe("GAS");
    expect(copied.particle.thimbleFilter).toBe("");
  });

  it("측정점은 같은 순번의 온도·동정압(배출가스 온도·동압·정압·DGM 입/출구)만 옮기고 채취시간·적산값은 그대로 둔다", () => {
    const target = getDefaultSheetForm("GAS", 2);
    target.samplingPoints[1] = { ...target.samplingPoints[1], Pv: "9", samplingTime: "15", beforeVm: "100" };

    const copied = copyCommonSections(target, filled());

    expect(copied.samplingPoints).toHaveLength(2);
    expect(copied.samplingPoints[0]).toMatchObject({
      Ts: "120", Pv: "5", Ps: "-2", inTm: "20", outTm: "30", samplingTime: "", beforeVm: "",
    });
    expect(copied.samplingPoints[1]).toMatchObject({
      Ts: "121", Pv: "5", Ps: "-2", inTm: "21", outTm: "31", samplingTime: "15", beforeVm: "100",
    });
  });

  it("앞 기록지보다 측정점이 많으면 넘치는 순번은 비워 둔다", () => {
    const copied = copyCommonSections(getDefaultSheetForm("GAS", 3), filled());

    expect(copied.samplingPoints).toHaveLength(3);
    expect(copied.samplingPoints[2].Ts).toBe("");
  });
});

describe("findSyncSource", () => {
  it("탭 순서상 바로 앞 기록지가 출처이고 첫 기록지는 출처가 없다", () => {
    const sheets = [getDefaultSheetForm("GAS"), getDefaultSheetForm("HEAVY_METAL"), getDefaultSheetForm("DUST")];

    expect(findSyncSource(sheets, 0)).toBeNull();
    expect(findSyncSource(sheets, 1)).toBe(sheets[0]);
    expect(findSyncSource(sheets, 2)).toBe(sheets[1]);
  });
});

describe("hasCommonSectionValues", () => {
  it("동기화 대상 칸에 값이 있으면 true, 대상이 아닌 칸만 채워져 있으면 false", () => {
    expect(hasCommonSectionValues(filled())).toBe(true);
    expect(hasCommonSectionValues(getDefaultSheetForm("GAS"))).toBe(false);

    const onlySampling = getDefaultSheetForm("GAS", 1);
    onlySampling.samplingPoints[0] = { ...onlySampling.samplingPoints[0], samplingTime: "10", beforeVm: "100" };
    expect(hasCommonSectionValues(onlySampling)).toBe(false);
  });

  it("측정점 온도·동정압 하나만 적혀 있어도 값이 있는 것으로 본다", () => {
    const sheet = getDefaultSheetForm("GAS", 2);
    sheet.samplingPoints[1] = { ...sheet.samplingPoints[1], Ps: "-3" };

    expect(hasCommonSectionValues(sheet)).toBe(true);
  });

  it("업무 기본값(O₂ 20.9·CO₂ 0)만 있으면 값이 없는 것이고, 농도 하나를 고치면 값이 있는 것이다", () => {
    const sheet = getDefaultSheetForm("GAS");
    expect(hasCommonSectionValues(sheet)).toBe(false);

    const touched = { ...sheet, exhaustGas: { ...sheet.exhaustGas, co: ["0", "0", "0.5"] } };
    expect(hasCommonSectionValues(touched)).toBe(true);
  });
});
