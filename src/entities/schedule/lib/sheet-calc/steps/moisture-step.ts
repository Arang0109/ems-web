import { STANDARD_MOLAR_VOLUME } from "../constants";
import type { SheetCalcContext, SheetCalcStep } from "../context";
import { toKelvin } from "../convert";
import { roundHalfUp } from "../math";

// MoistureStep — 수분 측정 파생값.
// ma/tm_g/vm_g는 각자 입력만 갖춰지면 계산한다(입력 중 피드백).
// Xw(%)는 서버 가드와 동일하게 전체 입력이 있어야 계산한다.

// Xw = 100 × 수분 부피 / (수분 부피 + 건조가스 부피), 모두 표준상태 환산
const calcXw = (ctx: SheetCalcContext): number | null => {
  if (ctx.ma == null || ctx.tm_g == null || ctx.vm_g == null || ctx.pa == null || ctx.pm_g == null) return null;

  const pm = ctx.pa + ctx.pm_g;
  const waterVolStp = ctx.ma * STANDARD_MOLAR_VOLUME / 18;
  const dryVolStp = ctx.vm_g * 273 / toKelvin(ctx.tm_g) * pm / 760;
  const denominator = waterVolStp + dryVolStp;
  if (denominator === 0) return null;

  // 서버: 100 × (비율 scale 5) — 추가 반올림 없음(scale 2 정규화만)
  return roundHalfUp(100 * waterVolStp / denominator, 2);
};

export const moistureStep: SheetCalcStep = (ctx, { sheet }) => {
  const moisture = sheet.moisture;
  if (!moisture) return;

  const before = moisture.bottleWeight?.before;
  const after = moisture.bottleWeight?.after;
  const tIn = moisture.gasMeterTemperature?.in;
  const tOut = moisture.gasMeterTemperature?.out;
  const volBefore = moisture.dryGasVolume?.before;
  const volAfter = moisture.dryGasVolume?.after;

  if (before != null && after != null) ctx.ma = roundHalfUp(after - before, 10);
  if (tIn != null && tOut != null) ctx.tm_g = roundHalfUp((tIn + tOut) / 2, 1);
  if (volBefore != null && volAfter != null) ctx.vm_g = roundHalfUp(volAfter - volBefore, 10);

  ctx.xw = calcXw(ctx);
};
