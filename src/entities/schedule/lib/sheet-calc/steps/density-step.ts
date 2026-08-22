import { STANDARD_MOLAR_VOLUME as SM } from "../constants";
import type { SheetCalcContext, SheetCalcStep } from "../context";
import { roundHalfUp } from "../math";

// DensityStep — 표준상태 배출가스밀도(round 2)와 현장조건 밀도(round 3).
// 현장조건 밀도는 반올림 전 원시 표준밀도를 쓴다.

// 표준상태 밀도 = 건조성분 밀도 × (100 − Xw)/100 + 수분 밀도 (반올림 전 원시값)
const calcStandardGasDensityRaw = (ctx: {
  o2: number; co2: number; co: number; n2: number; xw: number;
}): number => {
  const dryGasDensity =
    roundHalfUp(ctx.o2 / SM, 5) * 0.32 +
    roundHalfUp(ctx.co2 / SM, 5) * 0.44 +
    roundHalfUp(ctx.co / SM, 5) * 0.28 +
    roundHalfUp(ctx.n2 / SM, 5) * 0.28;
  const moistureDensity = roundHalfUp(roundHalfUp((18 * ctx.xw) / SM, 5) / 100, 5);
  return roundHalfUp((dryGasDensity * (100 - ctx.xw)) / 100, 5) + moistureDensity;
};

// 현장조건 밀도 = 표준밀도 × (273/Tg) × (Pg/760)
const calcGasDensity = (standardGasDensityRaw: number, ctx: SheetCalcContext): number | null => {
  if (ctx.avgTg == null || ctx.avgTg === 0 || ctx.pg == null) return null;
  return roundHalfUp(
    standardGasDensityRaw * roundHalfUp(273 / ctx.avgTg, 5) * roundHalfUp(ctx.pg / 760, 5),
    3,
  );
};

export const densityStep: SheetCalcStep = (ctx) => {
  const { o2, co2, co, n2, xw } = ctx;
  if (o2 == null || co2 == null || co == null || n2 == null || xw == null) return;

  const standardGasDensityRaw = calcStandardGasDensityRaw({ o2, co2, co, n2, xw });
  ctx.standardGasDensity = roundHalfUp(standardGasDensityRaw, 2);
  ctx.gasDensity = calcGasDensity(ctx.standardGasDensity, ctx);
};
