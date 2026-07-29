import type { Shape } from "@shared/model";

import type { NozzleSpecDto, ParticleSamplerSpecDto, PitotTubeSpecDto } from "../api/dto";
import type { ScheduleSnapshot, SheetSave } from "../model/types";

// ─────────────────────────────────────────────────────────────
// 측정 시트 계산 미리보기 — 서버 계산 파이프라인(schedule/application/calculation)의
// 프론트 미러링. 서버가 authority이며 이 결과는 저장 전 미리보기(추정)다.
//
// 서버 스텝 순서: InitStep → PressureStep → MoistureStep → ExhaustGasStep
//               → DensityStep → FlowStep → QuantityStep → ParticleStep → ApplyResultStep
//
// 파리티 필수 사항:
//  - 반올림은 서버와 동일하게 각 나눗셈 지점에서 HALF_UP scale을 적용한다.
//    (ParticleStep 내부 나눗셈은 scale 10 — 서버 SCALE 상수와 동일)
//  - null/부분입력은 서버 가드와 동일하게 조용히 건너뛴다(미완성 시트도 부분계산).
//    단, moisture의 ma/tm_g/vm_g는 입력 중 피드백을 위해 개별 가드로 계산한다
//    (서버는 수분 입력 전체가 완성돼야 채움 — 저장 시 서버 값으로 대체됨).
//  - 평균 정책 이원화: InitStep 평균은 null→0 취급, ParticleStep 집계는 null 제외.
// ─────────────────────────────────────────────────────────────

export type PitotCoefficient = { coefficient: number; velocity: number };

export type SheetCalcExternals = {
  standardOxygen: number | null;              // 기준산소농도 (측정시설 원장)
  shape: Shape | null;                        // 굴뚝 형상 (단면적·규정 측정점 수 계산)
  horizontalLength: number | null;            // 지름 또는 가로 (m)
  verticalLength: number | null;              // 세로 (m, 사각형)
  pitotCoefficients: PitotCoefficient[];      // 피토관 계수 테이블 (팀 장비 스냅샷)
  deltaH: number | null;                      // 오리피스 보정계수 △H@ (ParticleSampler spec, 없으면 46)
  nozzleDiameters: number[];                  // 노즐경 목록 (Nozzle spec, 추천용)
};

export type SheetCalcPointPreview = {
  avgTm: number | null;                       // (inTm+outTm)/2 (°C)
  Vs: number | null;                          // 점별 유속 (m/s)
  Vm: number | null;                          // 건식가스미터 채취량 (m³)
  Vlc: number | null;                         // 채취된 물의 총량 (ml)
  kFactor: number | null;
  orificeDp: number | null;
  isokineticRatio: number | null;             // 등속흡입계수 (%)
};

export type SheetCalcPreview = {
  weather: {
    pa: number | null;                        // 대기압 (mmHg)
  };
  moisture: {
    pm_g: number | null;                      // 가스미터 게이지압 (mmHg)
    pmGInchH2O: number | null;                // 게이지압 inchH₂O 환산 (표시 전용, 서버 미저장)
    tm_g: number | null;                      // 가스미터 평균온도 (°C)
    vm_g: number | null;                      // 흡입 건조가스량 (L)
    ma: number | null;                        // 흡습 수분질량 (g)
    xw: number | null;                        // 수분량 (%)
  };
  exhaustGas: {
    o2Avg: number | null;                     // 평균 농도 (표시 전용, 서버 미저장)
    co2Avg: number | null;
    coAvg: number | null;
    n2: number | null;
    noxAvg: number | null;
    soxAvg: number | null;
    standardGasDensity: number | null;        // 표준상태 배출가스밀도
    o2CorrectionFactor: number | null;        // 산소보정계수
  };
  quantity: {
    avgTg: number | null;                     // 배출가스 절대온도 (K)
    avgPv: number | null;
    avgPs: number | null;
    gasDensity: number | null;                // 현장조건 배출가스 밀도
    area: number | null;                      // 측정시설 단면적 (m²)
    Vs: number | null;                        // 평균 유속 (m/s)
    quantity: number | null;                  // 현장 습윤 유량 (m³/h)
    standardQuantity: number | null;          // 표준상태 건조 유량 (Sm³/h)
    Cp: number | null;                        // 피토관 계수
  };
  particle: {
    avgKFactor: number | null;
    avgOrificeDp: number | null;
    avgIsokineticRatio: number | null;
    totalVm: number | null;
    totalSamplingTime: number | null;
  };
  points: SheetCalcPointPreview[];            // 폼 측정점 배열과 인덱스 1:1
  samplingPointCnt: number | null;            // 규정상 요구 측정점 수
  avgTm: number | null;                       // 가스미터 절대온도 (K)
};

// ── 공용 헬퍼 (서버 Calculator 미러링) ───────────────────────────

// BigDecimal HALF_UP(부호 무관 반올림, .5는 절대값 증가)과 동일. fp 표현오차는 미세 nudge로 흡수.
const roundHalfUp = (value: number, scale: number): number => {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** scale;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.round(scaled + 1e-9);
  return (value < 0 ? -rounded : rounded) / factor;
};

// null은 0으로 취급해 평균(scale HALF_UP). 비어 있으면 0. (Calculator.averageTreatNullAsZero)
const averageTreatNullAsZero = (
  values: (number | null | undefined)[] | null | undefined,
  scale: number,
): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce<number>((acc, v) => acc + (v == null ? 0 : v), 0);
  return roundHalfUp(sum / values.length, scale);
};

// null 제외 평균 — ParticleStep 집계용. 비어 있으면 null.
const averageOrNull = (values: number[], scale: number): number | null => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return roundHalfUp(sum / values.length, scale);
};

const sumOrNull = (values: number[], scale: number): number | null => {
  if (values.length === 0) return null;
  return roundHalfUp(values.reduce((acc, v) => acc + v, 0), scale);
};

const isEmpty = (values: number[] | null | undefined): boolean => !values || values.length === 0;

// InitStep — 규정상 요구 측정점 수 (원형은 지름 구간별, 사각형은 1)
export const calcRequiredPointCount = (ext: SheetCalcExternals): number | null => {
  const { shape, horizontalLength: diameter } = ext;
  if (shape == null || diameter == null) return null;
  if (shape !== "CIRCULAR") return 1;
  if (diameter <= 1) return 1;
  if (diameter <= 2) return 2;
  if (diameter <= 4) return 3;
  if (diameter <= 4.5) return 4;
  return 5;
};

// ── 상수 (서버 스텝과 동일) ─────────────────────────────────────

const K_FACTOR_CONST = 0.0000803989;          // 8.03989 × 10⁻⁵ (공정시험법 개정 시 변경)
const DEFAULT_DELTA_H = 46;
const DEFAULT_CP = 0.84;
const ISO_CONST = 16670;                      // 1.667 × 10⁴
const MOISTURE_RATIO = roundHalfUp(18 / 22.4, 10); // 서버 MOISTURE_RATIO(scale 10)

// ── 스텝별 순수 공식 ────────────────────────────────────────────

// PressureStep — hPa → mmHg (scale 1)
const convertHpaToMmHg = (v: number): number => roundHalfUp((v * 760) / 1013.25, 1);
// PressureStep — mmH2O → mmHg (scale 2)
const convertMmH2OToMmHg = (v: number): number => roundHalfUp(v / 13.6, 2);

// FlowStep — 임시 유속을 속도구간에 매칭해 피토관 계수 조회(없으면 기본 0.84)
const findPitotCoefficient = (coefficients: PitotCoefficient[], velocity: number): number => {
  let result = DEFAULT_CP;
  for (const pc of coefficients) {
    if (pc.velocity != null && velocity >= pc.velocity) result = pc.coefficient;
  }
  return result;
};

// Flow/Quantity/ParticleStep — Vs = Cp × √(19.62 × Pv / gasDensity). 반올림 전 원시값.
const gasVelocityRaw = (cp: number, pv: number, gasDensity: number): number | null => {
  if (gasDensity <= 0) return null;
  const value = roundHalfUp((19.62 * pv) / gasDensity, 5);
  if (value < 0) return null;
  return cp * Math.sqrt(value);
};

// ── 내부 계산 컨텍스트 (서버 SheetContext 축적 미러링) ─────────────

export type SheetCalcContext = {
  pa: number | null;
  pg: number | null;
  pm_g: number | null;
  xw: number | null;
  tm_g: number | null;
  vm_g: number | null;
  ma: number | null;
  samplingPointCnt: number | null;
  area: number | null;
  o2: number | null;
  co2: number | null;
  co: number | null;
  n2: number | null;
  o2CorrectionFactor: number | null;
  Md: number | null;
  Mw: number | null;
  standardGasDensity: number | null;          // round 2 (표시·저장값)
  gasDensity: number | null;                  // 현장조건 (round 3)
  Cp: number | null;
  Vs: number | null;
  quantity: number | null;
  standardQuantity: number | null;
  avgTg: number | null;
  avgPv: number | null;
  avgPs: number | null;
  avgTm: number | null;
  points: SheetCalcPointPreview[];
  avgKFactor: number | null;
  avgOrificeDp: number | null;
  avgIsokineticRatio: number | null;
  totalVm: number | null;
  totalSamplingTime: number | null;
  // 표시 전용
  pmGInchH2O: number | null;
  noxAvg: number | null;
  soxAvg: number | null;
};

// 노즐 추천 등 파생 계산이 중간값(Md·Mw·Pg 등)을 재사용할 수 있도록 컨텍스트를 노출한다.
export const runSheetCalc = (sheet: SheetSave, ext: SheetCalcExternals): SheetCalcContext => {
  const ctx: SheetCalcContext = {
    pa: null, pg: null, pm_g: null,
    xw: null, tm_g: null, vm_g: null, ma: null,
    samplingPointCnt: null, area: null,
    o2: null, co2: null, co: null, n2: null,
    o2CorrectionFactor: null, Md: null, Mw: null,
    standardGasDensity: null, gasDensity: null,
    Cp: null, Vs: null, quantity: null, standardQuantity: null,
    avgTg: null, avgPv: null, avgPs: null, avgTm: null,
    points: (sheet.samplingPoints ?? []).map(() => ({
      avgTm: null, Vs: null, Vm: null, Vlc: null,
      kFactor: null, orificeDp: null, isokineticRatio: null,
    })),
    avgKFactor: null, avgOrificeDp: null, avgIsokineticRatio: null,
    totalVm: null, totalSamplingTime: null,
    pmGInchH2O: null, noxAvg: null, soxAvg: null,
  };

  // InitStep — 단면적(원형 π·d²/4, 사각 가로×세로), 규정 측정점 수, 측정점 평균
  const { shape, horizontalLength: horizontal, verticalLength: vertical } = ext;
  if (shape != null && horizontal != null) {
    if (shape === "CIRCULAR") {
      ctx.area = roundHalfUp(roundHalfUp((Math.PI * horizontal * horizontal) / 4, 5), 3);
    } else if (vertical != null) {
      ctx.area = roundHalfUp(horizontal * vertical, 3);
    }
  }
  ctx.samplingPointCnt = calcRequiredPointCount(ext);
  const points = sheet.samplingPoints ?? [];
  if (points.length > 0) {
    ctx.avgTg = averageTreatNullAsZero(points.map((p) => (p.Ts == null ? null : p.Ts + 273)), 1);
    ctx.avgPv = averageTreatNullAsZero(points.map((p) => p.Pv), 1);
    ctx.avgPs = averageTreatNullAsZero(points.map((p) => p.Ps), 1);
  }

  // PressureStep — Pa(대기압), Pm_g(게이지압), Pg(배출가스 절대압력)
  const pressure = sheet.weather?.pressure;
  if (pressure != null) ctx.pa = convertHpaToMmHg(pressure);
  const gasMeterGaugePressure = sheet.moisture?.gasMeterGaugePressure;
  if (gasMeterGaugePressure != null) {
    ctx.pm_g = convertMmH2OToMmHg(gasMeterGaugePressure);
    ctx.pmGInchH2O = roundHalfUp(gasMeterGaugePressure / 25.4, 2);
  }
  if (ctx.pa != null && ctx.avgPs != null) ctx.pg = ctx.pa + convertMmH2OToMmHg(ctx.avgPs);

  // MoistureStep — 파생값 ma/tm_g/vm_g는 각자 입력만 갖춰지면 계산(입력 중 피드백),
  // Xw(%)는 서버 가드와 동일하게 전체 입력 필요
  const moisture = sheet.moisture;
  if (moisture) {
    const before = moisture.weight?.before;
    const after = moisture.weight?.after;
    const tIn = moisture.gasMeterTemperature?.in;
    const tOut = moisture.gasMeterTemperature?.out;
    const volBefore = moisture.dryGasVolume?.before;
    const volAfter = moisture.dryGasVolume?.after;

    if (before != null && after != null) ctx.ma = roundHalfUp(after - before, 10);
    if (tIn != null && tOut != null) ctx.tm_g = roundHalfUp((tIn + tOut) / 2, 1);
    if (volBefore != null && volAfter != null) ctx.vm_g = roundHalfUp(volAfter - volBefore, 10);

    if (ctx.ma != null && ctx.tm_g != null && ctx.vm_g != null && ctx.pa != null && ctx.pm_g != null) {
      const pm = ctx.pa + ctx.pm_g;
      const waterVolStp = ctx.ma * roundHalfUp(22.4 / 18, 5);
      const dryVolStp = ctx.vm_g * roundHalfUp(273 / (273 + ctx.tm_g), 5) * roundHalfUp(pm / 760, 5);
      const denominator = waterVolStp + dryVolStp;
      if (denominator !== 0) {
        // 서버: 100 × (비율 scale 5) — 추가 반올림 없음(scale 3 정규화만)
        ctx.xw = roundHalfUp(100 * roundHalfUp(waterVolStp / denominator, 5), 3);
      }
    }
  }

  // ExhaustGasStep — 평균 농도(O2·CO2·CO·N2), 산소보정계수, 건조·습윤 분자량
  const exhaustGas = sheet.exhaustGas;
  if (
    exhaustGas &&
    !(isEmpty(exhaustGas.o2Concentration) && isEmpty(exhaustGas.co2Concentration) && isEmpty(exhaustGas.coConcentration))
  ) {
    ctx.o2 = averageTreatNullAsZero(exhaustGas.o2Concentration, 1);
    ctx.co2 = averageTreatNullAsZero(exhaustGas.co2Concentration, 1);
    ctx.co = averageTreatNullAsZero(exhaustGas.coConcentration, 1);
    ctx.n2 = roundHalfUp(100 - (ctx.o2 + ctx.co2 + ctx.co), 10);

    if (ext.standardOxygen != null) {
      // 기준산소농도가 대기 산소농도(20.9%) 이상이면 보정하지 않는다(=1)
      if (ext.standardOxygen >= 20.9) {
        ctx.o2CorrectionFactor = 1;
      } else {
        const denominator = 21 - ctx.o2;
        ctx.o2CorrectionFactor = denominator === 0 ? null : roundHalfUp((21 - ext.standardOxygen) / denominator, 5);
      }
    }

    ctx.Md = roundHalfUp(0.32 * ctx.o2 + 0.44 * ctx.co2 + 0.28 * ctx.co + 0.28 * ctx.n2, 10);
    if (ctx.xw != null) {
      const b = roundHalfUp(ctx.xw / 100, 5);
      ctx.Mw = roundHalfUp(ctx.Md * (1 - b) + 18 * b, 10);
    }

    // NOx/SOx 평균은 서버 미저장 — 표시 전용
    if (!isEmpty(exhaustGas.noxConcentration)) ctx.noxAvg = averageTreatNullAsZero(exhaustGas.noxConcentration, 1);
    if (!isEmpty(exhaustGas.soxConcentration)) ctx.soxAvg = averageTreatNullAsZero(exhaustGas.soxConcentration, 1);
  }

  // DensityStep — 표준가스밀도(round 2) + 현장조건 밀도(round 3, 원시 표준밀도 기반)
  if (ctx.o2 != null && ctx.co2 != null && ctx.co != null && ctx.n2 != null && ctx.xw != null) {
    const SM = 22.4;
    const dryGasDensity =
      roundHalfUp(ctx.o2 / SM, 5) * 0.32 +
      roundHalfUp(ctx.co2 / SM, 5) * 0.44 +
      roundHalfUp(ctx.co / SM, 5) * 0.28 +
      roundHalfUp(ctx.n2 / SM, 5) * 0.28;
    const moistureDensity = roundHalfUp(roundHalfUp((18 * ctx.xw) / SM, 5) / 100, 5);
    const standardGasDensityRaw = roundHalfUp(roundHalfUp((dryGasDensity * (100 - ctx.xw)) / 100, 5) + moistureDensity, 2);
    ctx.standardGasDensity = roundHalfUp(standardGasDensityRaw, 2);

    if (ctx.avgTg != null && ctx.avgTg !== 0 && ctx.pg != null) {
      ctx.gasDensity = roundHalfUp(
        standardGasDensityRaw * roundHalfUp(273 / ctx.avgTg, 5) * roundHalfUp(ctx.pg / 760, 5),
        3,
      );
    }
  }

  // FlowStep — 임시 유속(기본 Cp 0.84)으로 피토관 계수 조회
  if (ext.pitotCoefficients.length > 0 && ctx.avgPv != null && ctx.gasDensity != null) {
    const postGasVelocity = gasVelocityRaw(DEFAULT_CP, ctx.avgPv, ctx.gasDensity);
    if (postGasVelocity != null) ctx.Cp = findPitotCoefficient(ext.pitotCoefficients, postGasVelocity);
  }

  // QuantityStep — 평균 유속·현장 습윤 유량·표준상태 건조 유량 (유량은 반올림 전 원시 유속 기반)
  if (ctx.Cp != null && ctx.avgPv != null && ctx.gasDensity != null) {
    const vsRaw = gasVelocityRaw(ctx.Cp, ctx.avgPv, ctx.gasDensity);
    if (vsRaw != null) {
      ctx.Vs = roundHalfUp(vsRaw, 3);
      if (ctx.area != null) {
        const quantityRaw = 3600 * ctx.area * vsRaw;
        ctx.quantity = roundHalfUp(quantityRaw, 1);
        if (ctx.avgTg != null && ctx.avgTg !== 0 && ctx.pg != null && ctx.xw != null) {
          ctx.standardQuantity = roundHalfUp(
            quantityRaw *
              roundHalfUp(273 / ctx.avgTg, 5) *
              roundHalfUp(ctx.pg / 760, 5) *
              (1 - roundHalfUp(ctx.xw / 100, 5)),
            1,
          );
        }
      }
    }
  }

  // ParticleStep — 측정점별 등속흡인 계산 + 입자상 집계 (내부 나눗셈은 scale 10)
  if (points.length > 0 && points.some((p) => p.particle != null)) {
    const deltaH = ext.deltaH ?? DEFAULT_DELTA_H;
    const kFactors: number[] = [];
    const orificeDps: number[] = [];
    const isokineticRatios: number[] = [];
    const vms: number[] = [];
    const samplingTimes: number[] = [];
    const tmRaws: number[] = [];

    points.forEach((p, i) => {
      const ps = p.particle;
      if (ps == null) return;

      const inTm = ps.equipmentTemperature?.inTm;
      const outTm = ps.equipmentTemperature?.outTm;
      const tmRaw = inTm != null && outTm != null ? roundHalfUp((inTm + outTm) / 2, 10) : null;
      const tm = tmRaw == null ? null : tmRaw + 273;
      const tg = p.Ts == null ? null : p.Ts + 273;
      const pgPoint = ctx.pa != null && p.Ps != null ? ctx.pa + roundHalfUp(p.Ps / 13.6, 10) : null;
      const nozzleSize = ps.nozzleSize;

      // kFactor = K × Cp² × △H × (nozzle×10)⁴ × (1 − Xw/100)² × (Md·Tm·Pg점)/(Mw·Tg·Pa)
      let kFactor: number | null = null;
      if (
        ctx.Cp != null && nozzleSize != null && ctx.xw != null && ctx.Md != null && ctx.Mw != null &&
        tm != null && tg != null && ctx.pa != null && pgPoint != null &&
        ctx.Mw !== 0 && tg !== 0 && ctx.pa !== 0
      ) {
        const nz4 = (nozzleSize * 10) ** 4;
        const cp2 = ctx.Cp * ctx.Cp;
        const moistureRate = 1 - roundHalfUp(ctx.xw / 100, 10);
        const frac = roundHalfUp((ctx.Md * tm * pgPoint) / (ctx.Mw * tg * ctx.pa), 10);
        kFactor = roundHalfUp(K_FACTOR_CONST * cp2 * deltaH * nz4 * moistureRate * moistureRate * frac, 2);
      }
      const orificeDp = kFactor != null && p.Pv != null ? roundHalfUp(kFactor * p.Pv, 2) : null;

      const beforeVm = ps.equipmentVolume?.beforeVm;
      const afterVm = ps.equipmentVolume?.afterVm;
      const vm = beforeVm != null && afterVm != null ? roundHalfUp(afterVm - beforeVm, 5) : null;

      // Vlc = Vm × 10³ × (Xw / (100 − Xw)) × (18/22.4)
      let vlc: number | null = null;
      if (ctx.xw != null && vm != null && 100 - ctx.xw !== 0) {
        vlc = roundHalfUp(vm * 1000 * roundHalfUp(ctx.xw / (100 - ctx.xw), 10) * MOISTURE_RATIO, 2);
      }

      const vsPoint =
        ctx.Cp != null && p.Pv != null && ctx.gasDensity != null
          ? (() => {
              const raw = gasVelocityRaw(ctx.Cp, p.Pv, ctx.gasDensity);
              return raw == null ? null : roundHalfUp(raw, 3);
            })()
          : null;

      // 노즐 단면적 An = π × nozzle² / 4 (scale 10 → round 3)
      const an = nozzleSize != null ? roundHalfUp(roundHalfUp((Math.PI * nozzleSize * nozzleSize) / 4, 10), 3) : null;

      // isokineticRatio = [Tg × (0.00346·Vlc + Vm·(Pm/Tm))] / [Pg × t × Vs × An] × 1.667×10⁴
      let isokineticRatio: number | null = null;
      const t = ps.samplingTime;
      if (
        tg != null && vlc != null && vm != null && ctx.pa != null && orificeDp != null &&
        tm != null && ctx.pg != null && t != null && vsPoint != null && an != null &&
        tm !== 0 && ctx.pg !== 0 && t !== 0 && vsPoint !== 0 && an !== 0
      ) {
        const pm = ctx.pa + roundHalfUp(orificeDp / 13.6, 10);
        const a = tg * (0.00346 * vlc + vm * roundHalfUp(pm / tm, 10));
        const b = ctx.pg * t * vsPoint * an;
        isokineticRatio = roundHalfUp(roundHalfUp(a / b, 10) * ISO_CONST, 1);
      }

      ctx.points[i] = {
        avgTm: tmRaw == null ? null : roundHalfUp(tmRaw, 1),
        Vs: vsPoint,
        Vm: vm,
        Vlc: vlc,
        kFactor,
        orificeDp,
        isokineticRatio,
      };

      if (kFactor != null) kFactors.push(kFactor);
      if (orificeDp != null) orificeDps.push(orificeDp);
      if (isokineticRatio != null) isokineticRatios.push(isokineticRatio);
      if (vm != null) vms.push(vm);
      if (t != null) samplingTimes.push(t);
      if (tmRaw != null) tmRaws.push(tmRaw);
    });

    ctx.avgKFactor = averageOrNull(kFactors, 2);
    ctx.avgOrificeDp = averageOrNull(orificeDps, 2);
    ctx.avgIsokineticRatio = averageOrNull(isokineticRatios, 1);
    ctx.totalVm = sumOrNull(vms, 5);
    ctx.totalSamplingTime = sumOrNull(samplingTimes, 1);

    // 가스미터 절대온도 avgTm = 평균((inTm+outTm)/2, scale 1) + 273
    const avgTmRaw = averageOrNull(tmRaws, 1);
    if (avgTmRaw != null) ctx.avgTm = avgTmRaw + 273;
  }

  return ctx;
};

export const calcSheetPreview = (sheet: SheetSave, ext: SheetCalcExternals): SheetCalcPreview => {
  const ctx = runSheetCalc(sheet, ext);
  return {
    weather: { pa: ctx.pa },
    moisture: {
      pm_g: ctx.pm_g,
      pmGInchH2O: ctx.pmGInchH2O,
      tm_g: ctx.tm_g,
      vm_g: ctx.vm_g,
      ma: ctx.ma,
      xw: ctx.xw,
    },
    exhaustGas: {
      o2Avg: ctx.o2,
      co2Avg: ctx.co2,
      coAvg: ctx.co,
      n2: ctx.n2,
      noxAvg: ctx.noxAvg,
      soxAvg: ctx.soxAvg,
      standardGasDensity: ctx.standardGasDensity,
      o2CorrectionFactor: ctx.o2CorrectionFactor,
    },
    quantity: {
      avgTg: ctx.avgTg,
      avgPv: ctx.avgPv,
      avgPs: ctx.avgPs,
      gasDensity: ctx.gasDensity,
      area: ctx.area,
      Vs: ctx.Vs,
      quantity: ctx.quantity,
      standardQuantity: ctx.standardQuantity,
      Cp: ctx.Cp,
    },
    particle: {
      avgKFactor: ctx.avgKFactor,
      avgOrificeDp: ctx.avgOrificeDp,
      avgIsokineticRatio: ctx.avgIsokineticRatio,
      totalVm: ctx.totalVm,
      totalSamplingTime: ctx.totalSamplingTime,
    },
    points: ctx.points,
    samplingPointCnt: ctx.samplingPointCnt,
    avgTm: ctx.avgTm,
  };
};

// ── 스냅샷에서 계산 외부입력 추출 ────────────────────────────────
// 표준산소농도·굴뚝 형상/치수는 측정시설(stack) 원장, 피토관 계수·△H@·노즐경은
// 팀 장비 스냅샷의 spec에 있다. spec은 판별 필드가 없으므로 장비 type으로 판별한다.

export const getSheetCalcExternals = (snapshot: ScheduleSnapshot): SheetCalcExternals => {
  const stack = snapshot.client?.workplace?.stack;
  const equipments = snapshot.equipments ?? [];

  const pitotSpec = equipments.find((e) => e.type === "PITOT_TUBE")?.spec as PitotTubeSpecDto | null | undefined;
  const samplerSpec = equipments.find((e) => e.type === "PARTICLE_SAMPLER")?.spec as ParticleSamplerSpecDto | null | undefined;
  const nozzleSpec = equipments.find((e) => e.type === "NOZZLE")?.spec as NozzleSpecDto | null | undefined;

  return {
    standardOxygen: stack?.standardOxygen ?? null,
    shape: stack?.shape ?? null,
    horizontalLength: stack?.horizontalLength ?? null,
    verticalLength: stack?.verticalLength ?? null,
    pitotCoefficients: pitotSpec?.coefficients ?? [],
    deltaH: samplerSpec?.orificeDp ?? null,
    nozzleDiameters: nozzleSpec?.diameters?.map((d) => d.diameter) ?? [],
  };
};
