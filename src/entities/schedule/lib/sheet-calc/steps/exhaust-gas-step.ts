import type { SheetCalcStep } from "../context";
import { averageTreatNullAsZero, isEmpty, roundHalfUp } from "../math";

// ExhaustGasStep — 평균 농도(O2·CO2·CO·N2), 산소보정계수, 건조·습윤 분자량.
// O2·CO2·CO 농도가 모두 비어 있으면 스텝 전체를 건너뛴다(서버 가드와 동일).

// 산소보정계수 = (21 − 기준산소) / (21 − 측정산소).
// 기준산소농도가 대기 산소농도(20.9%) 이상이면 보정하지 않는다(=1).
const calcO2CorrectionFactor = (o2: number, standardOxygen: number): number | null => {
  if (standardOxygen >= 20.9) return 1;
  const denominator = 21 - o2;
  return denominator === 0 ? null : roundHalfUp((21 - standardOxygen) / denominator, 5);
};

export const exhaustGasStep: SheetCalcStep = (ctx, { sheet, ext }) => {
  const exhaustGas = sheet.exhaustGas;
  if (!exhaustGas) return;
  if (
    isEmpty(exhaustGas.o2Concentration) &&
    isEmpty(exhaustGas.co2Concentration) &&
    isEmpty(exhaustGas.coConcentration)
  ) {
    return;
  }

  ctx.o2 = averageTreatNullAsZero(exhaustGas.o2Concentration, 1);
  ctx.co2 = averageTreatNullAsZero(exhaustGas.co2Concentration, 1);
  ctx.co = averageTreatNullAsZero(exhaustGas.coConcentration, 1);
  ctx.n2 = roundHalfUp(100 - (ctx.o2 + ctx.co2 + ctx.co), 10);

  if (ext.standardOxygen != null) {
    ctx.o2CorrectionFactor = calcO2CorrectionFactor(ctx.o2, ext.standardOxygen);
  }

  // Md: 건조 배출가스 분자량, Mw: 습윤 배출가스 분자량
  ctx.Md = roundHalfUp(0.32 * ctx.o2 + 0.44 * ctx.co2 + 0.28 * ctx.co + 0.28 * ctx.n2, 10);
  if (ctx.xw != null) {
    const moistureRate = roundHalfUp(ctx.xw / 100, 5);
    ctx.Mw = roundHalfUp(ctx.Md * (1 - moistureRate) + 18.01 * moistureRate, 10);
  }

  // NOx/SOx 평균은 서버 미저장 — 표시 전용
  if (!isEmpty(exhaustGas.noxConcentration)) ctx.noxAvg = averageTreatNullAsZero(exhaustGas.noxConcentration, 1);
  if (!isEmpty(exhaustGas.soxConcentration)) ctx.soxAvg = averageTreatNullAsZero(exhaustGas.soxConcentration, 1);
};
