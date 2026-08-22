import { DEFAULT_CP } from "../constants";
import type { SheetCalcStep } from "../context";
import { findPitotCoefficient, gasVelocityRaw } from "../formula";

// FlowStep — 기본 Cp(0.84)로 임시 유속을 구하고, 그 속도구간에 맞는 피토관 계수를 확정한다.

export const flowStep: SheetCalcStep = (ctx, { ext }) => {
  if (ext.pitotCoefficients.length === 0 || ctx.avgPv == null || ctx.gasDensity == null) return;

  const postGasVelocity = gasVelocityRaw(DEFAULT_CP, ctx.avgPv, ctx.gasDensity);
  if (postGasVelocity == null) return;

  ctx.Cp = findPitotCoefficient(ext.pitotCoefficients, postGasVelocity);
};
