// 측정계획 목 — 분할 전 `handlers/schedule.ts` 의 한 조각. 조립은 `./index.ts`.
import { roundHalfUp } from '@shared/lib';
import type { MeasurementCategory } from '@shared/model';

import { STANDARD_OXYGEN } from './fixtures';

export const avg = (arr: unknown[]): number | null => {
  const nums = arr.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  return roundHalfUp(nums.reduce((a, b) => a + b, 0) / nums.length, 2);
};

// 계산에 사용하는 필드만 명시한 느슨한 시트 형태(나머지는 그대로 통과).
export interface LooseSheet {
  category?: MeasurementCategory;
  version?: number | null;
  samplingPoints?: { gasTemperature?: number; dynamicPressure?: number; staticPressure?: number }[];
  weather?: { atmosphericPressure?: number; atmosphericPressureMmHg?: number | null };
  flowRate?: Record<string, unknown> | null;
  exhaustGas?: { o2Concentration?: number[]; o2CorrectionFactor?: number | null };
  [key: string]: unknown;
}

// 서버 SheetCalculator의 핵심만 흉내낸다 (유량 집계·대기압·산소보정계수).
export const computeSheet = (sheet: LooseSheet): LooseSheet => {
  const points = sheet.samplingPoints ?? [];
  const averageGasTemperatureKelvin = avg(
    points.map((p) => (typeof p.gasTemperature === 'number' ? p.gasTemperature + 273 : null)));
  const averageDynamicPressure = avg(points.map((p) => p.dynamicPressure));
  const averageStaticPressure = avg(points.map((p) => p.staticPressure));

  const hpa = sheet.weather?.atmosphericPressure;
  const atmosphericPressureMmHg = typeof hpa === 'number' ? roundHalfUp((hpa * 760) / 1013.25, 2) : null;

  const o2Avg = avg(sheet.exhaustGas?.o2Concentration ?? []);
  const o2CorrectionFactor =
    o2Avg != null && 21 - o2Avg !== 0 ? roundHalfUp((21 - STANDARD_OXYGEN) / (21 - o2Avg), 5) : null;

  return {
    ...sheet,
    weather: { ...sheet.weather, atmosphericPressureMmHg },
    exhaustGas: { ...sheet.exhaustGas, o2CorrectionFactor },
    flowRate: {
      ...sheet.flowRate,
      averageGasTemperatureKelvin, averageDynamicPressure, averageStaticPressure,
    },
  };
};

