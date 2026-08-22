import { useMemo, useState } from "react";

import { useMeasurementRecords } from "@entities/measurement-record";

import {
  ALL_YEARS, filterHistory, toAllowanceLine, toHistoryItems, toHistoryRows,
  toHistorySeries, toHistoryYears, type YearFilter,
} from "./measurement-history";

/**
 * 측정이력 탭의 데이터·필터 상태.
 *
 * 전체 기간을 한 번 받아 두고 좁히기는 화면에서 한다 — 연도 선택지 자체를 데이터에서 뽑아야 해서
 * 연도별로 나눠 받으면 어떤 연도가 있는지 알 수 없다.
 *
 * 표와 차트의 좁히는 범위가 다르다. 표는 회차별 모든 항목을 보여주고(연도만 적용),
 * 차트는 항목 하나의 추이라 항목까지 좁힌다 — 항목마다 단위가 달라 한 축에 겹쳐 그릴 수 없다.
 */
export const useMeasurementHistory = (stackId: number | null) => {
  const { data, isLoading, error } = useMeasurementRecords(stackId);

  const [year, setYear] = useState<YearFilter>(ALL_YEARS);
  const [pollutantId, setPollutantId] = useState<number | null>(null);

  // 연도 선택지는 전체 기간에서 뽑는다 — 연도를 좁힌 뒤에도 다른 연도로 옮겨갈 수 있어야 한다.
  const years = useMemo(() => toHistoryYears(data), [data]);

  const yearRecords = useMemo(() => filterHistory(data, year, null), [data, year]);

  // 항목 선택지는 좁힌 연도 기준이다 — 그 해에 측정하지 않은 항목을 고르면 빈 차트가 된다.
  // 선택한 항목이 그 연도에 없거나 아직 안 골랐으면 첫 항목으로 되돌린다.
  // 파생값이라 상태 동기화(useEffect + setState)가 필요 없다.
  const items = useMemo(() => toHistoryItems(yearRecords), [yearRecords]);
  const selectedItem =
    items.find((item) => item.pollutantId === pollutantId) ?? items[0] ?? null;

  const series = useMemo(
    () => toHistorySeries(filterHistory(yearRecords, ALL_YEARS, selectedItem?.pollutantId ?? null)),
    [yearRecords, selectedItem],
  );
  const rows = useMemo(() => toHistoryRows(yearRecords), [yearRecords]);
  const allowance = useMemo(() => toAllowanceLine(series), [series]);

  return {
    isLoading,
    error,
    hasRecords: data.length > 0,
    years,
    items,
    year,
    setYear,
    selectedItem,
    setPollutantId,
    series,
    allowance,
    rows,
  };
};
