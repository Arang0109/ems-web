import type { SheetCalcStep } from "../context";
import { convertHpaToMmHg, convertMmH2OToInchH2O, convertMmH2OToMmHg } from "../convert";

// PressureStep — Pa(대기압), Pm_g(가스미터 게이지압), Pg(배출가스 절대압력).
// Pg는 InitStep이 채운 avgPs에 의존한다.

export const pressureStep: SheetCalcStep = (ctx, { sheet }) => {
  const pressure = sheet.weather?.pressure;
  if (pressure != null) ctx.pa = convertHpaToMmHg(pressure);

  const gasMeterGaugePressure = sheet.moisture?.gasMeterGaugePressure;
  if (gasMeterGaugePressure != null) {
    ctx.pm_g = convertMmH2OToMmHg(gasMeterGaugePressure);
    ctx.pmGInchH2O = convertMmH2OToInchH2O(gasMeterGaugePressure);
  }

  if (ctx.pa != null && ctx.avgPs != null) ctx.pg = ctx.pa + convertMmH2OToMmHg(ctx.avgPs);
};
