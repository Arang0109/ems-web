import type { SheetCalcContext, SheetCalcStep } from "../context";
import { gasVelocityRaw } from "../formula";
import { roundHalfUp } from "../math";

// QuantityStep — 평균 유속·현장 습윤 유량·표준상태 건조 유량.
// 유량은 반올림 전 원시 유속/원시 유량을 이어받아 계산한다(반올림 누적 방지).

// 표준상태 건조 유량 = 현장 유량 × (273/Tg) × (Pg/760) × (1 − Xw/100)
const calcStandardQuantity = (quantityRaw: number, ctx: SheetCalcContext): number | null => {
  if (ctx.avgTg == null || ctx.avgTg === 0 || ctx.pg == null || ctx.xw == null) return null;
  return roundHalfUp(
    quantityRaw * (273 / ctx.avgTg) * (ctx.pg / 760) * (1 - (ctx.xw / 100)),
    1,
  );
};

export const quantityStep: SheetCalcStep = (ctx) => {
  if (ctx.Cp == null || ctx.avgPv == null || ctx.gasDensity == null) return;

  const vsRaw = gasVelocityRaw(ctx.Cp, ctx.avgPv, ctx.gasDensity);
  if (vsRaw == null) return;
  ctx.Vs = roundHalfUp(vsRaw, 3);

  if (ctx.area == null) return;
  const quantityRaw = 3600 * ctx.area * ctx.Vs;
  ctx.quantity = roundHalfUp(quantityRaw, 1);
  ctx.standardQuantity = calcStandardQuantity(quantityRaw, ctx);
};
