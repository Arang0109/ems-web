import { describe, expect, it } from "vitest";

import type {
  GaseousSampling, MeasurementItemSnapshot, ParticulateSampling, SamplingSheet,
} from "@entities/schedule";
import type { MeasurementMode } from "@shared/model";

import {
  applySamplingTimes, collectSamplingTimes, countAmbiguousPollutants, countSamplingTimeChanges,
} from "./sampling-times";
import type { AnalysisRowForm } from "./types";

const sample = (over: Partial<GaseousSampling>): GaseousSampling => ({
  pollutantIds: null,
  sampleName: "", samplingStartedAt: null, samplingEndedAt: null,
  suctionQuantity: null, gasMeterGaugePressure: null,
  inTemperature: null, outTemperature: null,
  beforeVolume: null, afterVolume: null,
  blankSampleNumber: "", sampleNumber: "", samplingVolume: null,
  ...over,
});

const particle = (over: Partial<ParticulateSampling>): ParticulateSampling => ({
  averageKFactor: null, averageOrificeDifferentialPressure: null, averageIsokineticRatio: null,
  appliedNozzleDiameter: null, nozzleArea: null, averageGasMeterTemperature: null,
  totalDryGasVolume: null, totalSamplingTime: null,
  samplingStartedAt: null, samplingEndedAt: null,
  thimbleFilter: "", bgThimbleFilter: "",
  ...over,
});

const sheet = (
  gaseousSamplings: GaseousSampling[],
  over: Partial<Pick<SamplingSheet, "category" | "particulateSampling">> = {},
): SamplingSheet => ({
  category: "GAS", version: 1,
  weather: null, moisture: null, exhaustGas: null,
  flowRate: null, particulateSampling: null,
  samplingPoints: null, gaseousSamplings, samplingPointCount: null,
  ...over,
});

/** 시각 대응에 필요한 두 필드만 담은 최소 항목 */
const item = (pollutantId: number, mode: MeasurementMode | null) =>
  ({ pollutantId, mode } as MeasurementItemSnapshot);

const row = (pollutantId: number, startedAt = "", endedAt = ""): AnalysisRowForm => ({
  pollutantId, hasSavedValue: false,
  pollutantName: `물질${pollutantId}`, allowance: null, oxygenApplicable: false,
  samplingStartedAt: startedAt, samplingEndedAt: endedAt,
  analysisValue: "", unit: "", analysisMethod: "", analysisEquipment: "",
});

describe("collectSamplingTimes — 가스상 시료 행", () => {
  it("통칭 시료 한 행의 시각을 담긴 항목 전부에 준다", () => {
    const times = collectSamplingTimes([sheet([
      sample({ pollutantIds: [31, 32], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" }),
    ])], []);

    expect(times.get(31)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
    expect(times.get(32)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
  });

  it("링크가 없는 행(구 문서·수동 추가)은 가져올 것이 없다", () => {
    const times = collectSamplingTimes([sheet([
      sample({ pollutantIds: null, sampleName: "VOCs", samplingStartedAt: "09:00:00" }),
    ])], []);

    expect(times.size).toBe(0);
  });

  // 시각이 빈 행까지 가져오면 실험실에서 적어 둔 값을 빈 값으로 덮는다
  it("시각이 하나도 없는 행은 건너뛴다", () => {
    const times = collectSamplingTimes([sheet([sample({ pollutantIds: [31] })])], []);

    expect(times.size).toBe(0);
  });

  it("여러 기록지에 같은 항목이 적혀 있으면 먼저 나온 기록지를 쓴다", () => {
    const sheets = [
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" })]),
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "13:00:00", samplingEndedAt: "14:00:00" })]),
    ];

    expect(collectSamplingTimes(sheets, []).get(31)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
    expect(countAmbiguousPollutants(sheets, [])).toBe(1);
  });
});

describe("collectSamplingTimes — 입자상 집계", () => {
  const DUST = 1;
  const LEAD = 8;
  const SO2 = 31;
  const items = [item(DUST, "DUST"), item(LEAD, "HEAVY_METAL"), item(SO2, "GAS_SAMPLING")];

  const dustSheet = sheet([], {
    category: "DUST",
    particulateSampling: particle({ samplingStartedAt: "09:00:00", samplingEndedAt: "09:40:00" }),
  });

  // 입자상 블록에는 pollutantId 가 없다 — 어느 항목이 받는지는 항목의 mode 가 정한다
  it("그 방식(mode)의 항목에만 시트 집계 시각을 준다", () => {
    const times = collectSamplingTimes([dustSheet], items);

    expect(times.get(DUST)).toEqual({ startedAt: "09:00", endedAt: "09:40" });
    expect(times.has(LEAD)).toBe(false);
    expect(times.has(SO2)).toBe(false);
  });

  it("해당 항목이 없으면(mode null 인 구 문서) 아무것도 내지 않는다", () => {
    expect(collectSamplingTimes([dustSheet], [item(DUST, null)]).size).toBe(0);
  });

  it("집계 시각이 둘 다 비면 건너뛴다", () => {
    const empty = sheet([], { category: "DUST", particulateSampling: particle({}) });

    expect(collectSamplingTimes([empty], items).size).toBe(0);
  });

  // 서버(IsokineticSampleStep)가 등속흡인 행의 시각을 같은 시트의 입자상 집계로 맞춰 두므로 두 경로는 같은 값이다
  it("등속흡인 행과 같은 시트의 입자상 집계가 같은 시각이면 충돌이 아니다", () => {
    const metalSheet = sheet(
      [sample({ pollutantIds: [LEAD], samplingStartedAt: "10:00:00", samplingEndedAt: "10:40:00" })],
      {
        category: "HEAVY_METAL",
        particulateSampling: particle({ samplingStartedAt: "10:00:00", samplingEndedAt: "10:40:00" }),
      },
    );

    expect(collectSamplingTimes([metalSheet], items).get(LEAD)).toEqual({ startedAt: "10:00", endedAt: "10:40" });
    expect(countAmbiguousPollutants([metalSheet], items)).toBe(0);
  });

  it("가스상 행과 입자상 집계가 다른 시각이면 가스상 행을 먼저 쓰고 충돌로 센다", () => {
    const metalSheet = sheet(
      [sample({ pollutantIds: [LEAD], samplingStartedAt: "10:00:00", samplingEndedAt: "10:40:00" })],
      {
        category: "HEAVY_METAL",
        particulateSampling: particle({ samplingStartedAt: "11:00:00", samplingEndedAt: "11:40:00" }),
      },
    );

    expect(collectSamplingTimes([metalSheet], items).get(LEAD)).toEqual({ startedAt: "10:00", endedAt: "10:40" });
    expect(countAmbiguousPollutants([metalSheet], items)).toBe(1);
  });
});

describe("applySamplingTimes", () => {
  const times = collectSamplingTimes([sheet([
    sample({ pollutantIds: [31, 32], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" }),
  ])], []);

  it("통칭 행 하나를 항목별 두 행으로 편다", () => {
    const next = applySamplingTimes([row(31), row(32)], times);

    expect(next.map((r) => [r.samplingStartedAt, r.samplingEndedAt]))
      .toEqual([["09:00", "10:00"], ["09:00", "10:00"]]);
  });

  it("기록지에 없는 항목의 행은 그대로 둔다", () => {
    const untouched = row(99, "11:00", "12:00");

    expect(applySamplingTimes([untouched], times)[0]).toBe(untouched);
  });

  it("실제로 달라지는 행만 센다", () => {
    expect(countSamplingTimeChanges([row(31, "09:00", "10:00"), row(32)], times)).toBe(1);
  });
});
