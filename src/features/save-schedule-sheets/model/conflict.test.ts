import { describe, expect, it } from "vitest";

import type { SamplingSheet } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";

import {
  describeSheetDiff, diffSheetVersions, getChangedSheets, getResolvableCategories, hasSheetDivergence,
  resolveWithServer, toSheetBaseline,
} from "./conflict";
import { getDefaultSheetForm } from "./types";
import type { SheetForm } from "./types";

// 서버 시트는 대조에 쓰이는 category·version 만 의미가 있고, 나머지는 fromSheet 가 읽을 수 있으면 된다.
const serverSheet = (category: MeasurementCategory, version: number | null): SamplingSheet => ({
  category,
  version,
  weather: {
    atmosphericPressure: null, weatherCondition: null, temperature: null, humidity: null,
    windDirection: null, windSpeed: null, atmosphericPressureMmHg: null,
  },
  moisture: {
    bottleWeight: { before: null, after: null },
    gasMeterTemperature: { in: null, out: null },
    dryGasVolume: { before: null, after: null },
    suctionVelocity: null, gasMeterGaugePressure: null,
    samplingStartTime: null, samplingEndTime: null,
    gasMeterGaugePressureMmHg: null, gasMeterGaugePressureInH2O: null,
    averageGasMeterTemperature: null, sampledDryGasVolume: null,
    absorbedMoistureMass: null, moistureRatio: null,
  },
  exhaustGas: {
    o2Concentration: [], co2Concentration: [], coConcentration: [],
    noxConcentration: [], soxConcentration: [],
    gasAnalyzerStartTime: null, thcAnalyzerStartTime: null,
    standardGasDensity: null, o2CorrectionFactor: null,
    avgO2: null, avgCo2: null, avgCo: null, avgNox: null, avgSox: null,
  },
  flowRate: null,
  particulateSampling: null,
  samplingPoints: [],
  gaseousSamplings: [],
  samplingPointCount: null,
});

// 내 입력이 살아남았는지 확인하려면 폼에 구분 가능한 값이 있어야 한다.
const myForm = (category: MeasurementCategory, version: number | null, marker = ""): SheetForm => ({
  ...getDefaultSheetForm(category),
  version,
  particle: { ...getDefaultSheetForm(category).particle, thimbleFilter: marker },
});

describe("diffSheetVersions", () => {
  it("버전이 같으면 충돌이 아니다", () => {
    const diff = diffSheetVersions([myForm("GAS", 3)], [serverSheet("GAS", 3)]);

    expect(diff.conflicted).toEqual([]);
    expect(hasSheetDivergence(diff)).toBe(false);
  });

  it("내가 입력한 시트의 서버 버전이 앞서 있으면 충돌로 잡는다", () => {
    const diff = diffSheetVersions(
      [myForm("GAS", 3), myForm("DUST", 1)],
      [serverSheet("GAS", 4), serverSheet("DUST", 1)],
      [],
      ["GAS"],
    );

    expect(diff.conflicted).toEqual(["GAS"]);
    expect(diff.updatedByOthers).toEqual([]);
  });

  // 저장 시 손대지 않은 기록지까지 보내면 서버가 그 version 도 올려, 다음 사람에게 모든 기록지가
  // "수정됨"으로 보였다. 되돌림 대상인 것은 같지만 잃는 값이 없으므로 분류가 달라야 한다.
  it("손대지 않은 시트가 바뀌었으면 충돌이 아니라 최신화로 분류한다", () => {
    const diff = diffSheetVersions(
      [myForm("GAS", 3), myForm("DUST", 1)],
      [serverSheet("GAS", 4), serverSheet("DUST", 2)],
      [],
      ["GAS"],   // 내가 편집한 것은 가스상뿐이다
    );

    expect(diff.conflicted).toEqual(["GAS"]);
    expect(diff.updatedByOthers).toEqual(["DUST"]);
  });

  it("서버에만 있는 시트는 다른 사용자가 추가한 것으로 본다", () => {
    const diff = diffSheetVersions([myForm("GAS", 1)], [serverSheet("GAS", 1), serverSheet("DUST", 0)]);

    expect(diff.addedByOthers).toEqual(["DUST"]);
    expect(diff.conflicted).toEqual([]);
  });

  it("저장된 적 있는 내 시트가 서버에서 사라졌으면 다른 사용자가 삭제한 것으로 본다", () => {
    const diff = diffSheetVersions([myForm("GAS", 1), myForm("DUST", 2)], [serverSheet("GAS", 1)]);

    expect(diff.removedByOthers).toEqual(["DUST"]);
  });

  it("아직 저장한 적 없는 신규 시트는 서버에 없어도 삭제로 보지 않는다", () => {
    const diff = diffSheetVersions([myForm("GAS", 1), myForm("MERCURY", null)], [serverSheet("GAS", 1)]);

    expect(diff.removedByOthers).toEqual([]);
    expect(hasSheetDivergence(diff)).toBe(false);
  });

  it("같은 카테고리를 두 사람이 각자 새로 만들었으면 충돌로 잡는다", () => {
    const diff = diffSheetVersions([myForm("DUST", null)], [serverSheet("DUST", 0)], [], ["DUST"]);

    expect(diff.conflicted).toEqual(["DUST"]);
  });

  it("버전 도입 전에 저장된 서버 시트는 판정 대상이 아니다", () => {
    const diff = diffSheetVersions([myForm("GAS", null)], [serverSheet("GAS", null)]);

    expect(diff.conflicted).toEqual([]);
  });
});

describe("resolveWithServer", () => {
  it("충돌한 시트만 서버 값으로 바꾸고 나머지 내 입력은 지킨다", () => {
    const mine = [myForm("GAS", 3, "내가-입력한-가스"), myForm("DUST", 1, "내가-입력한-먼지")];
    const server = [serverSheet("GAS", 4), serverSheet("DUST", 1)];

    const resolved = resolveWithServer(mine, server, ["GAS"]);

    expect(resolved).toHaveLength(2);
    expect(resolved[0].version).toBe(4);
    expect(resolved[0].particle.thimbleFilter).toBe("");           // 서버 값으로 교체됨
    expect(resolved[1].particle.thimbleFilter).toBe("내가-입력한-먼지"); // 내 입력 유지
  });

  it("되돌린 뒤에는 충돌이 남지 않는다", () => {
    const mine = [myForm("GAS", 3), myForm("DUST", 1)];
    const server = [serverSheet("GAS", 4), serverSheet("DUST", 1), serverSheet("MERCURY", 0)];

    const diff = diffSheetVersions(mine, server);
    const resolved = resolveWithServer(mine, server, getResolvableCategories(diff));

    expect(hasSheetDivergence(diffSheetVersions(resolved, server))).toBe(false);
  });

  it("다른 사용자가 추가한 시트를 목록에 받아들인다", () => {
    const resolved = resolveWithServer([myForm("GAS", 1)], [serverSheet("GAS", 1), serverSheet("DUST", 0)], ["DUST"]);

    expect(resolved.map((sheet) => sheet.category)).toEqual(["GAS", "DUST"]);
  });

  it("다른 사용자가 삭제한 시트는 목록에서 뺀다", () => {
    const resolved = resolveWithServer([myForm("GAS", 1), myForm("DUST", 2)], [serverSheet("GAS", 1)], ["DUST"]);

    expect(resolved.map((sheet) => sheet.category)).toEqual(["GAS"]);
  });

  it("되돌릴 대상이 아닌 신규 시트는 그대로 남는다", () => {
    const resolved = resolveWithServer(
      [myForm("GAS", 1), myForm("MERCURY", null, "작성중")],
      [serverSheet("GAS", 2)],
      ["GAS"],
    );

    expect(resolved.map((sheet) => sheet.category)).toEqual(["GAS", "MERCURY"]);
    expect(resolved[1].particle.thimbleFilter).toBe("작성중");
  });
});

describe("diffSheetVersions — 삭제 예정 시트", () => {
  it("내가 지운 시트를 다른 사용자가 추가한 것으로 오인하지 않는다", () => {
    const diff = diffSheetVersions(
      [myForm("GAS", 1)],
      [serverSheet("GAS", 1), serverSheet("DUST", 2)],
      [{ category: "DUST", version: 2 }],
    );

    expect(diff.addedByOthers).toEqual([]);
    expect(hasSheetDivergence(diff)).toBe(false);
  });

  it("지우려는 사이 다른 사용자가 그 시트를 저장했으면 충돌이다", () => {
    const diff = diffSheetVersions(
      [myForm("GAS", 1)],
      [serverSheet("GAS", 1), serverSheet("DUST", 3)],
      [{ category: "DUST", version: 2 }],
    );

    expect(diff.conflicted).toEqual(["DUST"]);
  });

  it("다른 사용자가 먼저 지운 시트를 또 지우는 것은 충돌이 아니다", () => {
    const diff = diffSheetVersions([myForm("GAS", 1)], [serverSheet("GAS", 1)], [
      { category: "DUST", version: 2 },
    ]);

    expect(diff.conflicted).toEqual([]);
  });
});

describe("describeSheetDiff", () => {
  it("어긋난 기록지를 종류별로 밝히고 무엇을 잃는지 알린다", () => {
    const text = describeSheetDiff({
      conflicted: ["GAS"],
      updatedByOthers: [],
      addedByOthers: ["DUST"],
      removedByOthers: ["MERCURY"],
    });

    expect(text).toContain("가스상 — 내가 입력하는 사이 다른 사용자가 저장했습니다");
    expect(text).toContain("먼지 — 다른 사용자가 추가했습니다");
    expect(text).toContain("수은 — 다른 사용자가 삭제했습니다");
    expect(text).toContain("가스상 기록지에 입력한 값은 사라집니다");
  });

  it("내가 입력한 기록지가 없으면 잃을 값이 없다고 알린다", () => {
    const text = describeSheetDiff({
      conflicted: [],
      updatedByOthers: ["DUST"],
      addedByOthers: [],
      removedByOthers: [],
    });

    expect(text).toContain("먼지 — 다른 사용자가 수정했습니다");
    expect(text).toContain("되돌려도 잃는 값은 없습니다");
    expect(text).not.toContain("사라집니다");
  });
});

describe("getChangedSheets", () => {
  const baseline = toSheetBaseline([myForm("GAS", 1, "저장됨"), myForm("DUST", 2, "저장됨")]);

  // 손대지 않은 기록지까지 저장 요청에 실으면 서버가 그 version 도 올려,
  // 다음 사람이 저장할 때 건드린 적 없는 기록지가 전부 "수정됨"으로 잡힌다.
  it("값을 바꾸지 않은 기록지는 저장 대상에서 뺀다", () => {
    const sheets = [myForm("GAS", 1, "고침"), myForm("DUST", 2, "저장됨")];

    expect(getChangedSheets(sheets, baseline).map((s) => s.category)).toEqual(["GAS"]);
  });

  it("아무것도 바꾸지 않았으면 보낼 것이 없다", () => {
    const sheets = [myForm("GAS", 1, "저장됨"), myForm("DUST", 2, "저장됨")];

    expect(getChangedSheets(sheets, baseline)).toEqual([]);
  });

  it("신규 기록지는 기준선에 없으므로 항상 포함된다", () => {
    const sheets = [myForm("GAS", 1, "저장됨"), myForm("MERCURY", null)];

    expect(getChangedSheets(sheets, baseline).map((s) => s.category)).toEqual(["MERCURY"]);
  });

  it("저장 응답으로 기준선을 옮기면 다시 보낼 것이 없다", () => {
    const saved = [myForm("GAS", 2, "고침"), myForm("DUST", 2, "저장됨")];

    expect(getChangedSheets(saved, toSheetBaseline(saved))).toEqual([]);
  });
});
