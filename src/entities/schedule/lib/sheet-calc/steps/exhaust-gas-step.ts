import { roundHalfUp } from "@shared/lib";

import type { SheetCalcStep } from "../context";
import { averageTreatNullAsZero, isEmpty } from "../math";

// ExhaustGasStep — 평균 농도(O2·CO2·CO·N2), 산소보정계수, 건조·습윤 분자량.
// O2·CO2·CO 농도가 모두 비어 있으면 스텝 전체를 건너뛴다(서버 가드와 동일).

// 산소보정계수 = (21 − 기준산소) / (21 − 측정산소).
// 기준산소농도가 대기 산소농도(20.9%) 이상이면 보정하지 않는다(=1).
const calcO2CorrectionFactor = (o2: number, standardOxygen: number): number | null => {
  if (standardOxygen >= 20.9) return 1;
  const denominator = 21 - o2;
  return denominator === 0 ? null : roundHalfUp((21 - standardOxygen) / denominator, 5);
};

/**
 * NOx·SOx 회차 값의 평균(ppm, 소수 1자리 HALF_UP). 회차가 하나도 없으면 null.
 *
 * 서버는 이 평균을 저장하지 않는다 — `ExhaustGasData.avgNox`·`avgSox` 필드는 있지만 `ApplyResultStep` 이
 * 채우지 않아 응답에서 항상 null 이다. 그래서 현장 채취 탭의 계산값 드로어와 성적서 탭의 기록지 값
 * 가져오기가 모두 여기서 같은 규칙으로 낸다 — 두 화면이 각자 평균내면 반올림이 어긋난다.
 */
export const calcExhaustGasAverage = (values: number[] | null | undefined): number | null =>
  isEmpty(values) ? null : averageTreatNullAsZero(values, 1);

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
  ctx.noxAvg = calcExhaustGasAverage(exhaustGas.noxConcentration);
  ctx.soxAvg = calcExhaustGasAverage(exhaustGas.soxConcentration);
};
