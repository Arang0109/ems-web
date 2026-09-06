import type { SamplingPoint } from "../../../model/types";
import { DEFAULT_DELTA_H, ISO_CONST, K_FACTOR_CONST, MOISTURE_RATIO } from "../constants";
import type { SheetCalcContext, SheetCalcStep } from "../context";
import { convertMmH2OToMmHg, toKelvin } from "../convert";
import { gasVelocityRaw, nozzleArea } from "../formula";
import { averageOrNull, compactNumbers, roundHalfUp, sumOrNull } from "../math";
import type { SheetCalcPointPreview } from "../types";

// ParticleStep — 측정점별 등속흡인 계산 + 입자상 집계.
// 내부 나눗셈은 서버 SCALE 상수와 동일하게 scale 10을 쓴다.
// 집계 평균은 null을 제외한다(InitStep 평균과 정책이 다르다).

// 측정점 하나에서 뽑아낸 계산 전제값
type PointEnv = {
  tmRaw: number | null;             // 가스미터 평균온도 (°C, 반올림 전)
  tm: number | null;                // 가스미터 절대온도 (K)
  tg: number | null;                // 배출가스 절대온도 (K)
  pg: number | null;                // 측정점 절대압력 (mmHg)
  pv: number | null;                // 동압
  nozzleSize: number | null;
  vm: number | null;                // 건식가스미터 채취량 (m³)
  samplingTime: number | null;
};

type PointCalc = {
  preview: SheetCalcPointPreview;
  tmRaw: number | null;             // avgTm 집계는 반올림 전 값을 평균한다
  samplingTime: number | null;
};

const readPointEnv = (point: SamplingPoint, ctx: SheetCalcContext): PointEnv | null => {
  const isokinetic = point.isokineticSampling;
  if (isokinetic == null) return null;

  const inTm = isokinetic.gasTemperature?.inlet;
  const outTm = isokinetic.gasTemperature?.outlet;
  const tmRaw = inTm != null && outTm != null ? roundHalfUp((inTm + outTm) / 2, 10) : null;

  const beforeVm = isokinetic.gasMeterVolume?.before;
  const afterVm = isokinetic.gasMeterVolume?.after;
  const { gasTemperature: ts, staticPressure: ps, dynamicPressure: pv } = point;

  return {
    tmRaw,
    tm: tmRaw == null ? null : toKelvin(tmRaw),
    tg: ts == null ? null : toKelvin(ts),
    pg: ctx.pa != null && ps != null ? ctx.pa + convertMmH2OToMmHg(ps, 10) : null,
    pv,
    nozzleSize: isokinetic.nozzleDiameter,
    vm: beforeVm != null && afterVm != null ? roundHalfUp(afterVm - beforeVm, 5) : null,
    samplingTime: isokinetic.samplingTime,
  };
};

// kFactor = K × Cp² × △H × (nozzle×10)⁴ × (1 − Xw/100)² × (Md·Tm·Pg점)/(Mw·Tg·Pa)
const calcKFactor = (ctx: SheetCalcContext, env: PointEnv, deltaH: number): number | null => {
  const { Cp, xw, Md, Mw, pa } = ctx;
  const { nozzleSize, tm, tg, pg } = env;
  if (
    Cp == null || nozzleSize == null || xw == null || Md == null || Mw == null ||
    tm == null || tg == null || pa == null || pg == null ||
    Mw === 0 || tg === 0 || pa === 0
  ) {
    return null;
  }

  const nz4 = (nozzleSize * 10) ** 4;
  const cp2 = Cp * Cp;
  const moistureRate = 1 - roundHalfUp(xw / 100, 10);
  const frac = roundHalfUp((Md * tm * pg) / (Mw * tg * pa), 10);
  return roundHalfUp(K_FACTOR_CONST * cp2 * deltaH * nz4 * moistureRate * moistureRate * frac, 2);
};

// Vlc = Vm × 10³ × (Xw / (100 − Xw)) × (18/22.4)
const calcVlc = (ctx: SheetCalcContext, vm: number | null): number | null => {
  if (ctx.xw == null || vm == null || 100 - ctx.xw === 0) return null;
  return roundHalfUp(vm * 1000 * roundHalfUp(ctx.xw / (100 - ctx.xw), 10) * MOISTURE_RATIO, 2);
};

const calcPointVelocity = (ctx: SheetCalcContext, pv: number | null): number | null => {
  if (ctx.Cp == null || pv == null || ctx.gasDensity == null) return null;
  const raw = gasVelocityRaw(ctx.Cp, pv, ctx.gasDensity);
  return raw == null ? null : roundHalfUp(raw, 3);
};

// isokineticRatio = [Tg × (0.00346·Vlc + Vm·(Pm/Tm))] / [Pg × t × Vs × An] × 1.667×10⁴
const calcIsokineticRatio = (
  ctx: SheetCalcContext,
  env: PointEnv,
  derived: { vlc: number | null; orificeDp: number | null; vs: number | null; an: number | null },
): number | null => {
  const { tg, tm, vm, samplingTime: t } = env;
  const { vlc, orificeDp, vs, an } = derived;
  if (
    tg == null || vlc == null || vm == null || ctx.pa == null || orificeDp == null ||
    tm == null || ctx.pg == null || t == null || vs == null || an == null ||
    tm === 0 || ctx.pg === 0 || t === 0 || vs === 0 || an === 0
  ) {
    return null;
  }

  const pm = ctx.pa + convertMmH2OToMmHg(orificeDp, 10);
  const numerator = tg * (0.00346 * vlc + vm * roundHalfUp(pm / tm, 10));
  const denominator = ctx.pg * t * vs * an;
  return roundHalfUp(roundHalfUp(numerator / denominator, 10) * ISO_CONST, 1);
};

const calcPoint = (point: SamplingPoint, ctx: SheetCalcContext, deltaH: number): PointCalc | null => {
  const env = readPointEnv(point, ctx);
  if (env == null) return null;

  const kFactor = calcKFactor(ctx, env, deltaH);
  const orificeDp = kFactor != null && env.pv != null ? roundHalfUp(kFactor * env.pv, 2) : null;
  const vlc = calcVlc(ctx, env.vm);
  const vs = calcPointVelocity(ctx, env.pv);
  const an = env.nozzleSize != null ? nozzleArea(env.nozzleSize) : null;
  const isokineticRatio = calcIsokineticRatio(ctx, env, { vlc, orificeDp, vs, an });

  return {
    preview: {
      avgTm: env.tmRaw == null ? null : roundHalfUp(env.tmRaw, 1),
      Vs: vs,
      Vm: env.vm,
      Vlc: vlc,
      kFactor,
      orificeDp,
      isokineticRatio,
    },
    tmRaw: env.tmRaw,
    samplingTime: env.samplingTime,
  };
};

export const particleStep: SheetCalcStep = (ctx, { sheet, ext }) => {
  const points = sheet.samplingPoints ?? [];
  if (points.length === 0 || !points.some((p) => p.isokineticSampling != null)) return;

  const deltaH = ext.deltaH ?? DEFAULT_DELTA_H;
  const results = points.map((p) => calcPoint(p, ctx, deltaH));

  results.forEach((result, i) => {
    if (result != null) ctx.points[i] = result.preview;
  });

  const calculated = results.filter((r): r is PointCalc => r != null);
  const collect = (pick: (r: PointCalc) => number | null): number[] =>
    compactNumbers(calculated.map(pick));

  ctx.avgKFactor = averageOrNull(collect((r) => r.preview.kFactor), 2);
  ctx.avgOrificeDp = averageOrNull(collect((r) => r.preview.orificeDp), 2);
  ctx.avgIsokineticRatio = averageOrNull(collect((r) => r.preview.isokineticRatio), 1);
  ctx.totalVm = sumOrNull(collect((r) => r.preview.Vm), 5);
  ctx.totalSamplingTime = sumOrNull(collect((r) => r.samplingTime), 0);
  // 가스미터 절대온도 avgTm = 평균((inTm+outTm)/2, scale 1) + 273
  const avgTmRaw = averageOrNull(collect((r) => r.tmRaw), 1);
  if (avgTmRaw != null) ctx.avgTm = toKelvin(avgTmRaw);
};
