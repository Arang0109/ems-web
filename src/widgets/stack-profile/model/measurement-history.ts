import type { MeasurementRecord } from "@entities/measurement-record";
import { MEASUREMENT_CYCLE_LABEL } from "@shared/config";
import { formatNumber } from "@shared/lib";

/** 연도 선택의 "전체 기간". 숫자 연도와 한 값으로 다루려고 상수로 둔다. */
export const ALL_YEARS = "ALL";
export type YearFilter = number | typeof ALL_YEARS;

/** 차트에 그릴 한 회차. 서버 목록은 최신순이라 차트용으로는 오래된 순으로 뒤집는다. */
export type HistoryPoint = {
  scheduleId: number;
  /** x축 표기 — 같은 날 두 회차가 있을 수 있어 값이 겹칠 수 있다(툴팁이 회차를 구분한다) */
  label: string;
  sampledAt: string;
  concentration: number | null;
  /** 보정농도가 있으면 규제 판정은 이쪽으로 한다 */
  correctedConcentration: number | null;
  allowance: number | null;
  isExceeded: boolean;
};

/** 표에 그릴 한 행. 숫자는 표시 문자열로 미리 굳힌다. */
export type HistoryRow = {
  recordId: number;
  scheduleId: number;
  sampledAt: string;
  nameKr: string;
  cycle: string;
  periodLabel: string;
  concentration: string;
  correctedConcentration: string;
  emission: string;
  allowance: string;
  unit: string;
  isExceeded: boolean;
};

/** 차트에서 고를 수 있는 측정항목. 항목마다 단위가 달라 y축을 함께 갈아야 한다. */
export type HistoryItem = {
  pollutantId: number;
  nameKr: string;
  unit: string;
};

/**
 * 측정값 표기. 소수 자릿수를 6으로 넓혀 쓴다 — 로케일 기본값(3자리)으로는
 * 미량 항목(예: 0.0004 ppm)이 0 으로 보인다.
 */
export const formatMeasure = (value: number | null): string =>
  value === null ? "-" : formatNumber(value, { maxDecimals: 6 });

/** 이력에 실제로 존재하는 연도만 최신순으로 준다 — 측정이 없는 연도를 고르게 두지 않는다. */
export const toHistoryYears = (records: MeasurementRecord[]): number[] => {
  const years = new Set(records.map((record) => Number(record.sampledAt.slice(0, 4))));
  return [...years].filter((year) => !Number.isNaN(year)).sort((a, b) => b - a);
};

/**
 * 이력에 있는 측정항목 목록. 같은 항목이 회차마다 반복되므로 첫 등장만 남긴다.
 * 단위는 회차마다 같다고 보고 처음 채워진 값을 쓴다.
 */
export const toHistoryItems = (records: MeasurementRecord[]): HistoryItem[] => {
  const byId = new Map<number, HistoryItem>();

  for (const record of records) {
    const found = byId.get(record.pollutantId);
    if (!found) {
      byId.set(record.pollutantId, {
        pollutantId: record.pollutantId,
        nameKr: record.nameKr,
        unit: record.unit ?? "",
      });
      continue;
    }
    if (!found.unit && record.unit) found.unit = record.unit;
  }

  return [...byId.values()].sort((a, b) => a.nameKr.localeCompare(b.nameKr, "ko"));
};

/** 연도 · 측정항목으로 좁힌다. 둘 다 표시용 필터라 원본 정렬(최신순)은 유지한다. */
export const filterHistory = (
  records: MeasurementRecord[],
  year: YearFilter,
  pollutantId: number | null,
): MeasurementRecord[] =>
  records.filter((record) => {
    if (year !== ALL_YEARS && !record.sampledAt.startsWith(String(year))) return false;
    if (pollutantId !== null && record.pollutantId !== pollutantId) return false;
    return true;
  });

/**
 * 차트용 시계열. 오래된 순으로 뒤집고 x축 표기를 만든다.
 *
 * 초과 판정은 서버의 `exceeded` 를 그대로 쓴다 — 보정농도 적용 여부·기준 유무 판단이
 * 서버 도메인에 있어, 화면에서 다시 비교하면 두 판정이 어긋난다.
 */
export const toHistorySeries = (records: MeasurementRecord[]): HistoryPoint[] =>
  [...records]
    .sort((a, b) => a.sampledAt.localeCompare(b.sampledAt))
    .map((record) => ({
      scheduleId: record.scheduleId,
      label: record.sampledAt.slice(2).replace(/-/g, "."),   // "2026-03-14" → "26.03.14"
      sampledAt: record.sampledAt,
      concentration: record.concentration,
      correctedConcentration: record.correctedConcentration,
      allowance: record.allowance,
      isExceeded: record.exceeded === true,
    }));

/**
 * 차트에 그릴 허용기준선. 회차마다 값이 달라졌으면(기준 개정) 선 하나로 그릴 수 없으므로
 * null 을 준다 — 잘못된 기준선 하나를 그리는 것보다 안 그리는 편이 낫다.
 */
export const toAllowanceLine = (points: HistoryPoint[]): number | null => {
  const allowances = new Set(
    points.map((point) => point.allowance).filter((value): value is number => value !== null),
  );
  return allowances.size === 1 ? [...allowances][0] : null;
};

export const toHistoryRows = (records: MeasurementRecord[]): HistoryRow[] =>
  records.map((record) => ({
    recordId: record.recordId,
    scheduleId: record.scheduleId,
    sampledAt: record.sampledAt,
    nameKr: record.nameKr,
    cycle: MEASUREMENT_CYCLE_LABEL[record.cycle] ?? record.cycle,
    periodLabel: record.periodLabel ?? "-",
    concentration: formatMeasure(record.concentration),
    correctedConcentration: formatMeasure(record.correctedConcentration),
    emission: formatMeasure(record.emission),
    allowance: formatMeasure(record.allowance),
    unit: record.unit ?? "",
    isExceeded: record.exceeded === true,
  }));
