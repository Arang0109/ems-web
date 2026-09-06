import type { SheetCalcStep } from "../context";
import { toKelvin } from "../convert";
import { stackCircleArea } from "../formula";
import { averageTreatNullAsZero, roundHalfUp } from "../math";
import type { SheetCalcExternals } from "../types";

// InitStep — 단면적, 규정 측정점 수, 측정점 평균(Tg·Pv·Ps).
// 이 스텝의 평균은 null을 0으로 취급한다(ParticleStep 집계와 정책이 다르다).

// 규정상 요구 측정점 수 (원형은 지름 구간별, 사각형은 1)
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

// 단면적 — 원형 π·d²/4, 사각 가로×세로 (m²)
const calcArea = (ext: SheetCalcExternals): number | null => {
  const { shape, horizontalLength: horizontal, verticalLength: vertical } = ext;
  if (shape == null || horizontal == null) return null;
  if (shape === "CIRCULAR") return stackCircleArea(horizontal);
  if (vertical == null) return null;
  return roundHalfUp(horizontal * vertical, 3);
};

export const initStep: SheetCalcStep = (ctx, { sheet, ext }) => {
  ctx.area = calcArea(ext);
  ctx.samplingPointCnt = calcRequiredPointCount(ext);

  const points = sheet.samplingPoints ?? [];
  if (points.length === 0) return;

  ctx.avgTg = averageTreatNullAsZero(
    points.map((p) => (p.gasTemperature == null ? null : toKelvin(p.gasTemperature))), 1);
  ctx.avgPv = averageTreatNullAsZero(points.map((p) => p.dynamicPressure), 1);
  ctx.avgPs = averageTreatNullAsZero(points.map((p) => p.staticPressure), 1);
};
