import { describe, expect, it } from "vitest";

import type { GaseousSampling, SamplingSheet } from "@entities/schedule";

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

const sheet = (gaseousSamplings: GaseousSampling[]): SamplingSheet => ({
  category: "GAS", version: 1,
  weather: null, moisture: null, exhaustGas: null,
  flowRate: null, particulateSampling: null,
  samplingPoints: null, gaseousSamplings, samplingPointCount: null,
});

const row = (pollutantId: number, startedAt = "", endedAt = ""): AnalysisRowForm => ({
  pollutantId, hasSavedValue: false,
  pollutantName: `물질${pollutantId}`, allowance: null, oxygenApplicable: false,
  samplingStartedAt: startedAt, samplingEndedAt: endedAt,
  analysisValue: "", unit: "", analysisMethod: "", analysisEquipment: "",
});

describe("collectSamplingTimes", () => {
  it("통칭 시료 한 행의 시각을 담긴 항목 전부에 준다", () => {
    const times = collectSamplingTimes([sheet([
      sample({ pollutantIds: [31, 32], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" }),
    ])]);

    expect(times.get(31)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
    expect(times.get(32)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
  });

  it("링크가 없는 행(구 문서·수동 추가)은 가져올 것이 없다", () => {
    const times = collectSamplingTimes([sheet([
      sample({ pollutantIds: null, sampleName: "VOCs", samplingStartedAt: "09:00:00" }),
    ])]);

    expect(times.size).toBe(0);
  });

  // 시각이 빈 행까지 가져오면 실험실에서 적어 둔 값을 빈 값으로 덮는다
  it("시각이 하나도 없는 행은 건너뛴다", () => {
    const times = collectSamplingTimes([sheet([sample({ pollutantIds: [31] })])]);

    expect(times.size).toBe(0);
  });

  it("여러 기록지에 같은 항목이 적혀 있으면 먼저 나온 기록지를 쓴다", () => {
    const times = collectSamplingTimes([
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" })]),
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "13:00:00", samplingEndedAt: "14:00:00" })]),
    ]);

    expect(times.get(31)).toEqual({ startedAt: "09:00", endedAt: "10:00" });
    expect(countAmbiguousPollutants([
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" })]),
      sheet([sample({ pollutantIds: [31], samplingStartedAt: "13:00:00", samplingEndedAt: "14:00:00" })]),
    ])).toBe(1);
  });
});

describe("applySamplingTimes", () => {
  const times = collectSamplingTimes([sheet([
    sample({ pollutantIds: [31, 32], samplingStartedAt: "09:00:00", samplingEndedAt: "10:00:00" }),
  ])]);

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
