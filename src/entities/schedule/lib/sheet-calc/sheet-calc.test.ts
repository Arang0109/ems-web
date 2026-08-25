import { describe, expect, it } from "vitest";

import type { ParticleSampling, SamplingPoint, SheetSave } from "../../model/types";
import type { SheetCalcExternals } from "./types";
import { calcSheetPreview } from "./run";

// 서버 SheetCalculatorTest의 기대값을 프론트 계산 파리티 테스트로 이식한다.
// 공식/상수/반올림이 서버와 어긋나면 여기서 실패한다(이중 소스 드리프트 방어).

const gasPoint = (Ts: number, Pv: number, Ps: number): SamplingPoint => ({
  Ts, Pv, Ps, Vs: null, gasDensity: null, particle: null,
});

const particleSampling = (over: Partial<ParticleSampling> = {}): ParticleSampling => ({
  equipmentTemperature: { inTm: null, outTm: null, avgTm: null },
  equipmentVolume: { beforeVm: null, afterVm: null },
  samplingTime: null, vacuumGaugePressure: null, finalImpingerTemperature: null,
  nozzleSize: null, Vm: null, Vlc: null, kFactor: null, orificeDp: null, isokineticRatio: null,
  ...over,
});

const makeSheet = (over: Partial<SheetSave> = {}): SheetSave => ({
  category: "GAS",
  version: null,
  weather: {
    pressure: null, weatherCondition: null, temperature: null, humidity: null,
    windDirection: null, windSpeed: null, pa: null,
  },
  moisture: {
    weight: { before: null, after: null },
    gasMeterTemperature: { in: null, out: null },
    dryGasVolume: { before: null, after: null },
    suctionVelocity: null, gasMeterGaugePressure: null,
    samplingStartTime: null, samplingEndTime: null,
    pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
  },
  exhaustGas: {
    o2Concentration: [], co2Concentration: [], coConcentration: [],
    noxConcentration: [], soxConcentration: [],
    gasAnalyzerStartTime: null, thcAnalyzerStartTime: null,
    standardGasDensity: null, o2CorrectionFactor: null,
  },
  quantity: null,
  particle: null,
  samplingPoints: [],
  samples: [],
  samplingPointCnt: null,
  avgTm: null,
  ...over,
});

const makeExternals = (over: Partial<SheetCalcExternals> = {}): SheetCalcExternals => ({
  stackName: "", standardOxygen: null, shape: null, horizontalLength: null, verticalLength: null,
  pitotCoefficients: [], deltaH: null, nozzleDiameters: [],
  ...over,
});

// 서버 테스트와 동일 입력: 원형 굴뚝 지름 1m, 표준산소 4%, Cp 0.84 고정
const serverExternals = () =>
  makeExternals({
    standardOxygen: 4,
    shape: "CIRCULAR",
    horizontalLength: 1,
    pitotCoefficients: [{ coefficient: 0.84, velocity: 0 }],
  });

const serverInputs = (): Partial<SheetSave> => ({
  weather: {
    pressure: 1013.25, weatherCondition: null, temperature: null, humidity: null,
    windDirection: null, windSpeed: null, pa: null,
  },
  moisture: {
    weight: { before: 10, after: 15 },
    gasMeterTemperature: { in: 20, out: 22 },
    dryGasVolume: { before: 0, after: 50 },
    suctionVelocity: null, gasMeterGaugePressure: 0,
    samplingStartTime: null, samplingEndTime: null,
    pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
  },
  exhaustGas: {
    o2Concentration: [10], co2Concentration: [8], coConcentration: [0],
    noxConcentration: [], soxConcentration: [],
    gasAnalyzerStartTime: null, thcAnalyzerStartTime: null,
    standardGasDensity: null, o2CorrectionFactor: null,
  },
});

describe("calcSheetPreview — 서버 파이프라인 파리티", () => {
  it("가스상 시트를 유량까지 계산한다 (서버 SheetCalculatorTest 이식)", () => {
    const sheet = makeSheet({
      ...serverInputs(),
      samplingPoints: [gasPoint(100, 5, -2), gasPoint(100, 5, -2)],
    });

    const result = calcSheetPreview(sheet, serverExternals());

    // 대기압: 1013.25 hPa → 760.0 mmHg
    expect(result.weather.pa).toBeCloseTo(760.0, 5);
    // 수분량 Xw = 100 × (6.2222 / 52.6507 → scale5) = 11.818
    expect(result.moisture.xw).toBeCloseTo(11.818, 5);
    // 산소보정계수: (21-4)/(21-10) = 17/11 ≈ 1.54545
    expect(result.exhaustGas.o2CorrectionFactor).toBeCloseTo(1.54545, 5);
    // 규정상 요구 측정점 수: 원형 지름 1m ≤ 1 → 1 (배열 길이 2가 아님)
    expect(result.samplingPointCnt).toBe(1);

    // 유량 집계
    expect(result.quantity.area).toBeCloseTo(0.785, 5);           // π·1²/4 round 3
    expect(result.quantity.avgTg).toBeCloseTo(373.0, 5);
    expect(result.quantity.avgPv).toBeCloseTo(5.0, 5);
    expect(result.quantity.avgPs).toBeCloseTo(-2.0, 5);
    expect(result.quantity.Cp).toBeCloseTo(0.84, 5);
    expect(result.exhaustGas.standardGasDensity).toBeCloseTo(1.26, 5);
    expect(result.quantity.gasDensity).toBeCloseTo(0.924, 5);
    expect(result.quantity.Vs).toBeCloseTo(8.655, 5);
    expect(result.quantity.quantity as number).toBeGreaterThan(0);
    expect(result.quantity.standardQuantity as number).toBeGreaterThan(0);
    // 표준상태 건조 유량은 보정계수(<1)를 곱하므로 현장 습윤 유량보다 작다
    expect(result.quantity.standardQuantity as number).toBeLessThan(result.quantity.quantity as number);

    // 가스상 시트는 입자상 없음
    expect(result.particle.avgKFactor).toBeNull();
    expect(result.particle.totalVm).toBeNull();
    expect(result.points[0].kFactor).toBeNull();
    expect(result.avgTm).toBeNull();
  });

  it("입자상 시트를 등속흡인계수까지 계산한다 (서버 SheetCalculatorTest 이식)", () => {
    const sheet = makeSheet({
      ...serverInputs(),
      category: "DUST",
      samplingPoints: [{
        ...gasPoint(100, 5, -2),
        particle: particleSampling({
          nozzleSize: 0.6,
          samplingTime: 30,
          equipmentTemperature: { inTm: 20, outTm: 22, avgTm: null },
          equipmentVolume: { beforeVm: 0, afterVm: 1.5 },
        }),
      }],
    });

    const result = calcSheetPreview(sheet, serverExternals());
    const point = result.points[0];

    // 측정점별 등속흡인 결과가 모두 산출됨(양수)
    expect(point.kFactor as number).toBeGreaterThan(0);
    expect(point.Vlc as number).toBeGreaterThan(0);
    expect(point.isokineticRatio as number).toBeGreaterThan(0);
    expect(point.Vs as number).toBeGreaterThan(0);

    // Vm = afterVm - beforeVm = 1.5
    expect(point.Vm).toBeCloseTo(1.5, 5);
    // avgTm = (inTm + outTm) / 2 = 21.0
    expect(point.avgTm).toBeCloseTo(21.0, 5);
    // orificeDp = kFactor × Pv (Pv=5), round 2
    expect(point.orificeDp).toBeCloseTo(
      Math.round((point.kFactor as number) * 5 * 100) / 100, 5);

    // 입자상 집계 산출
    expect(result.particle.avgKFactor).toBeCloseTo(point.kFactor as number, 5);
    expect(result.particle.avgIsokineticRatio).toBeCloseTo(point.isokineticRatio as number, 5);
    expect(result.particle.totalVm).toBeCloseTo(1.5, 5);
    expect(result.particle.totalSamplingTime).toBeCloseTo(30, 5);
    // 가스미터 절대온도: 평균((in+out)/2) + 273 = 21 + 273 = 294.0
    expect(result.avgTm).toBeCloseTo(294.0, 5);
  });

  it("피토관 계수 테이블이 주어지면 속도구간에 매칭된 Cp를 반환한다", () => {
    const sheet = makeSheet({
      ...serverInputs(),
      samplingPoints: [gasPoint(100, 5, -2), gasPoint(100, 5, -2)],
    });

    const result = calcSheetPreview(sheet, makeExternals({
      standardOxygen: 4,
      pitotCoefficients: [{ velocity: 0, coefficient: 0.9 }],
    }));

    expect(result.quantity.Cp).toBe(0.9);
  });

  it("기준산소농도가 20.9% 이상이면 산소보정계수는 1이다", () => {
    const sheet = makeSheet({
      ...serverInputs(),
      samplingPoints: [gasPoint(100, 5, -2)],
    });

    const result = calcSheetPreview(sheet, makeExternals({ standardOxygen: 21 }));

    expect(result.exhaustGas.o2CorrectionFactor).toBe(1);
  });

  it("굴뚝 치수로 단면적과 규정 측정점 수를 산출한다", () => {
    const circular = calcSheetPreview(makeSheet(), makeExternals({ shape: "CIRCULAR", horizontalLength: 3 }));
    expect(circular.quantity.area).toBeCloseTo(7.069, 5);   // π·3²/4 = 7.06858 → round3
    expect(circular.samplingPointCnt).toBe(3);              // 2 < d ≤ 4 → 3

    const rect = calcSheetPreview(makeSheet(), makeExternals({
      shape: "RECTANGULAR", horizontalLength: 2, verticalLength: 1.5,
    }));
    expect(rect.quantity.area).toBeCloseTo(3, 5);
    expect(rect.samplingPointCnt).toBe(1);
  });

  it("무게 전/후만 입력해도 ma를 즉시 산출한다 (xw는 아직 null)", () => {
    const result = calcSheetPreview(
      makeSheet({
        moisture: {
          weight: { before: 10, after: 15 },
          gasMeterTemperature: { in: null, out: null },
          dryGasVolume: { before: null, after: null },
          suctionVelocity: null, gasMeterGaugePressure: null,
          samplingStartTime: null, samplingEndTime: null,
          pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
        },
      }),
      makeExternals(),
    );

    expect(result.moisture.ma).toBe(5);
    expect(result.moisture.tm_g).toBeNull();
    expect(result.moisture.vm_g).toBeNull();
    expect(result.moisture.xw).toBeNull();
  });

  it("가스미터 온도 입/출만 입력해도 tm_g(평균온도)를 즉시 산출한다", () => {
    const result = calcSheetPreview(
      makeSheet({
        moisture: {
          weight: { before: null, after: null },
          gasMeterTemperature: { in: 20, out: 23 },
          dryGasVolume: { before: null, after: null },
          suctionVelocity: null, gasMeterGaugePressure: null,
          samplingStartTime: null, samplingEndTime: null,
          pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
        },
      }),
      makeExternals(),
    );

    expect(result.moisture.tm_g).toBe(21.5);
    expect(result.moisture.ma).toBeNull();
    expect(result.moisture.xw).toBeNull();
  });

  it("입력이 비어도 예외 없이 전부 null을 반환한다", () => {
    const result = calcSheetPreview(makeSheet(), makeExternals());

    expect(result.weather.pa).toBeNull();
    expect(result.moisture.xw).toBeNull();
    expect(result.exhaustGas.standardGasDensity).toBeNull();
    expect(result.exhaustGas.o2CorrectionFactor).toBeNull();
    expect(result.quantity.avgTg).toBeNull();
    expect(result.quantity.Vs).toBeNull();
    expect(result.quantity.Cp).toBeNull();
    expect(result.particle.avgKFactor).toBeNull();
    expect(result.samplingPointCnt).toBeNull();
    expect(result.avgTm).toBeNull();
  });
});
