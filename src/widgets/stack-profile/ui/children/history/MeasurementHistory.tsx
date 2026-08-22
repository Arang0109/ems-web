import { useMemo } from "react";

import { Select } from "@shared/ui/form";
import { EmptyText } from "@shared/ui/feedback";

import { useMeasurementHistory } from "../../../model/use-measurement-history";
import { ALL_YEARS, type YearFilter } from "../../../model/measurement-history";
import { HistoryChart } from "./HistoryChart";
import { HistoryTable } from "./HistoryTable";

interface Props {
  stackId: number | null;
}

/**
 * 측정이력 탭 — 추이 차트와 회차별 기록표.
 *
 * 성적서 작성이 완료된 측정계획만 이력이 된다. 진행 중인 회차가 여기 없는 것은 누락이 아니다.
 */
export const MeasurementHistory = ({ stackId }: Props) => {
  const {
    isLoading, error, hasRecords,
    years, items, year, setYear, selectedItem, setPollutantId,
    series, allowance, rows,
  } = useMeasurementHistory(stackId);

  const yearOptions = useMemo(
    () => [
      { value: ALL_YEARS, label: "전체 기간" },
      ...years.map((y) => ({ value: String(y), label: `${y}년` })),
    ],
    [years],
  );

  const itemOptions = useMemo(
    () => items.map((item) => ({ value: String(item.pollutantId), label: item.nameKr })),
    [items],
  );

  if (isLoading) return <EmptyText>불러오는 중...</EmptyText>;
  if (error) return <p className="py-8 text-center text-body-2 text-danger">{error}</p>;
  if (!hasRecords) return <EmptyText>완료된 측정 이력이 없습니다.</EmptyText>;

  const handleYearChange = (value: string | null) => {
    setYear((value === null || value === ALL_YEARS ? ALL_YEARS : Number(value)) as YearFilter);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-h3 text-ink">측정이력</h3>

        <div className="flex items-center gap-2">
          <Select
            className="w-32"
            value={year === ALL_YEARS ? ALL_YEARS : String(year)}
            options={yearOptions}
            onValueChange={handleYearChange}
          />
          <Select
            className="w-40"
            value={selectedItem ? String(selectedItem.pollutantId) : ""}
            options={itemOptions}
            placeholder="측정항목"
            disabled={itemOptions.length === 0}
            onValueChange={(value) => setPollutantId(value === null ? null : Number(value))}
          />
        </div>
      </div>

      {/* 연도를 좁히면 그 해에 측정이 없을 수 있다 — 필터는 남겨 두고 본문만 비운다. */}
      {rows.length === 0 ? (
        <EmptyText>선택한 기간에 측정 이력이 없습니다.</EmptyText>
      ) : (
        <>
          {selectedItem && (
            <HistoryChart item={selectedItem} series={series} allowance={allowance} />
          )}
          <HistoryTable rows={rows} />
        </>
      )}
    </div>
  );
};
