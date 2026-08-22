import type { SheetCalcContext } from "./context";
import type { SheetCalcPreview } from "./types";

// ApplyResultStep 대응 — 누적 컨텍스트를 화면이 쓰는 섹션별 구조로 옮긴다.
// 값 변환은 하지 않고 배치만 한다.

export const toSheetCalcPreview = (ctx: SheetCalcContext): SheetCalcPreview => ({
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
});
