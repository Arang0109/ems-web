import { Badge } from "@shared/ui/badges";
import { EmptyText } from "@shared/ui/feedback";

import { COMMON_SOURCE_LABEL } from "../../model/derived/sampling-timeline";
import type { TemperatureTable, TemperatureTables } from "../../model/derived/temperature-table";

interface Props {
  temperatures: TemperatureTables;
}

const EMPTY_VALUE = "–";

const formatTemperature = (value: number | null) => (value === null ? EMPTY_VALUE : `${value}℃`);

const sourceBadge = (sourceLabel: string | null) =>
  sourceLabel && (
    <Badge size="sm" tone={sourceLabel === COMMON_SOURCE_LABEL ? "neutral" : "info"}>
      {sourceLabel}
    </Badge>
  );

/**
 * 표 하나. 구간 시각은 대상 칸 아래에 작게 둔다 — 칸을 따로 두면 측정점 표(온도 4칸)가 모바일 폭을 넘는다.
 */
const TableView = ({ table }: { table: TemperatureTable }) => (
  <section className="space-y-1">
    <div className="flex items-center gap-1.5">
      <span className="text-label text-ink">{table.label}</span>
      {sourceBadge(table.sourceLabel)}
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-caption tabular-nums">
        <thead>
          <tr className="border-b border-rule text-muted-ink">
            <th scope="col" className="py-1 pr-2 text-left font-normal">대상</th>
            {table.columns.map((column) => (
              <th key={column} scope="col" className="px-1.5 py-1 text-right font-normal whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id} className="border-b border-rule/60 last:border-b-0">
              <th scope="row" className="py-1 pr-2 text-left font-normal">
                <span className="block text-label text-ink">{row.label}</span>
                <span className="block text-ink-soft whitespace-nowrap">{row.timeText}</span>
              </th>
              {row.values.map((value, index) => (
                <td key={table.columns[index]} className="px-1.5 py-1 text-right text-ink whitespace-nowrap">
                  {formatTemperature(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

/**
 * 온도 — 섹션마다 흩어진 온도 입력을 구간 시각과 함께 표로 모은다.
 * 순서는 현장 순서(수분 → 측정점 → 가스상 시료)다. 대기온도는 딸린 구간이 없어 맨 위에 값만 적는다.
 */
export const TemperatureTableView = ({ temperatures }: Props) => {
  const { tables, ambient } = temperatures;

  return (
    <div className="space-y-4">
      {ambient.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-caption text-ink-soft">
          대기온도
          {ambient.map((item) => (
            <span key={item.value} className="inline-flex items-center gap-1">
              <span className="text-ink tabular-nums">{formatTemperature(item.value)}</span>
              {sourceBadge(item.sourceLabel)}
            </span>
          ))}
        </p>
      )}

      {tables.length === 0 ? (
        <EmptyText>
          시각에 딸린 온도가 없습니다. 수분·입자상 측정점·가스상 시료의 시각과 온도를 입력하면 표시됩니다.
        </EmptyText>
      ) : (
        tables.map((table) => <TableView key={table.id} table={table} />)
      )}
    </div>
  );
};
