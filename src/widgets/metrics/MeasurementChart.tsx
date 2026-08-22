import { useMemo, useState } from 'react';
import {
  LineChart, Line, LabelList, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { addDays, differenceInCalendarDays, endOfYear, startOfYear } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import type { MeasurementCountChartResponse } from '@entities/dashboard';

import { Panel } from '@shared/ui/cards';
import { IconButton } from '@shared/ui/buttons';
import { DateRangePicker, type DateRange } from '@shared/ui/form';
import { useIsMobile } from '@shared/model';

import { formatNumber } from "@shared/lib";

/**
 * 측정건수 추이 차트.
 *
 * 헤더의 기간 컨트롤(범위 선택 · 이전/다음)은 **표시용 로컬 상태**다.
 * 서버 `GET /api/dashboard/measurement-stats` 가 기간 파라미터를 받지 않아
 * (올해 1~12월 고정 응답) 선택한 기간으로 데이터를 필터링하지 않는다.
 * 서버가 파라미터를 지원하게 되면 `range` 를 그대로 조회 훅에 넘기면 된다.
 */

interface Props {
  stats: MeasurementCountChartResponse[];
}

/** 값 라벨이 서로 겹치기 시작하는 지점. 이보다 촘촘하면 라벨을 숨긴다. */
const MAX_LABELED_POINTS = 12;

/** 선택된 기간을 자기 길이만큼 앞뒤로 통째로 이동시킨다. */
const shiftRange = (range: DateRange, direction: -1 | 1): DateRange => {
  if (!range.from) return range;
  if (!range.to) return { from: addDays(range.from, direction) };

  const span = differenceInCalendarDays(range.to, range.from) + 1;
  return {
    from: addDays(range.from, span * direction),
    to: addDays(range.to, span * direction),
  };
};

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-rule shadow-lg rounded-icon-tile px-3 py-2">
      <p className="text-caption text-muted-ink mb-0.5">{label}</p>
      <p className="text-body-4 text-ink">
        {formatNumber(payload[0].value)}
        <span className="text-caption text-muted-ink ml-1">건</span>
      </p>
    </div>
  );
};

const LegendSwatch = ({ color, children }: { color: string; children: string }) => (
  <span className="flex items-center gap-1.5">
    <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
    <span className="text-caption text-muted-ink">{children}</span>
  </span>
);

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

/** 최댓값 지점만 진한 색·큰 반경으로 강조한다(범례의 "최다 측정"). */
const createDot = (maxIndex: number) =>
  function ChartDot({ cx, cy, index }: DotProps) {
    if (cx === undefined || cy === undefined) return null;
    const isMax = index === maxIndex;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isMax ? 5 : 4}
        fill={isMax ? 'var(--ink)' : 'var(--chart-1)'}
        stroke="var(--surface)"
        strokeWidth={2}
      />
    );
  };

export const MeasurementChart = ({ stats }: Props) => {
  const isMobile = useIsMobile();
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: startOfYear(today), to: endOfYear(today) };
  });

  const maxIndex = useMemo(() => {
    if (!stats.length) return -1;
    return stats.reduce((best, d, i) => (d.count > stats[best].count ? i : best), 0);
  }, [stats]);

  const showLabels = !isMobile && stats.length <= MAX_LABELED_POINTS;

  const handleShift = (direction: -1 | 1) => {
    setRange((prev) => (prev ? shiftRange(prev, direction) : prev));
  };

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 text-ink">측정건수 현황</h2>
          <p className="text-body-2 text-ink-soft">기간별 측정 건수 추이</p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <IconButton
            variant="outline"
            icon={<ChevronLeftIcon />}
            label="이전 기간"
            onClick={() => handleShift(-1)}
          />
          <IconButton
            variant="outline"
            icon={<ChevronRightIcon />}
            label="다음 기간"
            onClick={() => handleShift(1)}
          />
        </div>
      </header>

      <div className="px-5 py-4 rounded-panel inset-ring-1 inset-ring-rule">
        <div className="flex items-center gap-4 pl-2">
          <LegendSwatch color="var(--chart-1)">완료 건수</LegendSwatch>
          <LegendSwatch color="var(--ink)">최다 측정</LegendSwatch>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats} margin={{ top: 28, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--rule)" vertical={false} />
            {!isMobile && (
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-ink)' }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
            )}
            {!isMobile && (
              <YAxis
                width={36}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--muted-ink)' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--rule-dark)', strokeWidth: 1 }}
            />
            <Line
              type="linear"
              dataKey="count"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={createDot(maxIndex)}
              activeDot={{ r: 6, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
            >
              {showLabels && (
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={10}
                  fill="var(--ink)"
                  fontSize={12}
                  fontWeight={600}
                />
              )}
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};
