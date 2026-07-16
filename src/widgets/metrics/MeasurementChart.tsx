import { useIsMobile } from '@shared/model';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

import type { MeasurementCountChartResponse } from '@entities/dashboard';

interface Props {
  stats: MeasurementCountChartResponse[];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value.toLocaleString()}<span className="text-muted-foreground font-normal ml-1">건</span></p>
    </div>
  );
};

export const MeasurementChart = ({ stats }: Props) => {
  const isMobile = useIsMobile();
  const total = stats.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...stats.map((d) => d.count));

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">측정건수 현황</h2>
          <p className="text-xs text-muted-foreground mt-0.5">기간별 측정 건수 추이</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <div className="bg-indigo-50 dark:bg-indigo-500/15 rounded-xl px-4 py-3">
          <p className="text-xs text-indigo-400">총 측정건수</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
            {total.toLocaleString()}
            <span className="text-sm font-normal text-indigo-400 ml-1">건</span>
          </p>
        </div>
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">최다 측정</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {max.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="measureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            {!isMobile && (
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            {!isMobile && (
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#measureGradient)"
              dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
