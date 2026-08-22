import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { useIsMobile } from "@shared/model";

import { formatMeasure, type HistoryItem, type HistoryPoint } from "../../../model/measurement-history";

interface Props {
  item: HistoryItem;
  series: HistoryPoint[];
  /** 회차마다 기준이 달라졌으면 null — 잘못된 기준선 하나를 그리는 것보다 안 그리는 편이 낫다 */
  allowance: number | null;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  return (
    <div className="rounded-icon-tile border border-rule bg-surface px-3 py-2 shadow-lg">
      <p className="mb-0.5 text-caption text-muted-ink">{point.sampledAt}</p>
      <p className="text-body-4 text-ink">{formatMeasure(point.concentration)}</p>
      {point.correctedConcentration !== null && (
        <p className="text-caption text-muted-ink">
          보정 {formatMeasure(point.correctedConcentration)}
        </p>
      )}
      {point.isExceeded && <p className="text-caption text-danger">허용기준 초과</p>}
    </div>
  );
};

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: HistoryPoint;
}

/** 초과 회차만 붉게 키운다 — 표를 훑지 않고도 어느 회차가 문제였는지 바로 짚을 수 있어야 한다. */
const ChartDot = ({ cx, cy, payload }: DotProps) => {
  if (cx === undefined || cy === undefined) return null;

  const isExceeded = payload?.isExceeded === true;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isExceeded ? 5 : 4}
      fill={isExceeded ? "var(--danger)" : "var(--chart-1)"}
      stroke="var(--surface)"
      strokeWidth={2}
    />
  );
};

const LegendSwatch = ({ color, children }: { color: string; children: string }) => (
  <span className="flex items-center gap-1.5">
    <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
    <span className="text-caption text-muted-ink">{children}</span>
  </span>
);

/** 측정항목 하나의 농도 추이. 항목마다 단위가 달라 한 축에 여러 항목을 겹쳐 그리지 않는다. */
export const HistoryChart = ({ item, series, allowance }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-panel px-5 py-4 inset-ring-1 inset-ring-rule">
      <div className="flex flex-wrap items-center gap-4 pl-2">
        <span className="text-body-4 text-ink">
          {item.nameKr}
          {item.unit && <span className="ml-1 text-caption text-muted-ink">({item.unit})</span>}
        </span>
        <LegendSwatch color="var(--chart-1)">측정 농도</LegendSwatch>
        <LegendSwatch color="var(--danger)">허용기준 초과</LegendSwatch>
        {allowance !== null && <LegendSwatch color="var(--muted-ink)">허용기준</LegendSwatch>}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={series} margin={{ top: 28, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--rule)" vertical={false} />
          {!isMobile && (
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-ink)" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
          )}
          {!isMobile && (
            <YAxis
              width={48}
              tick={{ fontSize: 11, fill: "var(--muted-ink)" }}
              axisLine={false}
              tickLine={false}
            />
          )}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "var(--rule-dark)", strokeWidth: 1 }}
          />
          {allowance !== null && (
            <ReferenceLine
              y={allowance}
              stroke="var(--muted-ink)"
              strokeDasharray="6 4"
              label={{
                value: `허용기준 ${formatMeasure(allowance)}`,
                position: "insideTopRight",
                fill: "var(--muted-ink)",
                fontSize: 11,
              }}
            />
          )}
          <Line
            type="linear"
            dataKey="concentration"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            connectNulls
            dot={<ChartDot />}
            activeDot={{ r: 6, fill: "var(--chart-1)", stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
