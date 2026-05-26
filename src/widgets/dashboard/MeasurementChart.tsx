import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import type { MeasurementStats } from '@/entities/dashboard/model/dashboard-types';

type Period = 'monthly' | 'weekly' | 'daily';

interface Props {
  stats: MeasurementStats;
}

const PERIOD_LABELS: Record<Period, string> = {
  monthly: '월별',
  weekly: '주별',
  daily: '일별',
};

const CHART_COLORS = {
  monthly: { stroke: '#6366f1', fill: '#6366f1', gradient: ['#818cf8', '#4f46e5'] },
  weekly: { stroke: '#10b981', fill: '#10b981', gradient: ['#34d399', '#059669'] },
  daily: { stroke: '#f59e0b', fill: '#f59e0b', gradient: ['#fbbf24', '#d97706'] },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-800">
          {payload[0].value.toLocaleString()}
          <span className="text-xs font-normal text-gray-500 ml-1">건</span>
        </p>
      </div>
    );
  }
  return null;
};

export const MeasurementChart = ({ stats }: Props) => {
  const [period, setPeriod] = useState<Period>('monthly');
  const data = stats[period];
  const color = CHART_COLORS[period];
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">측정건수 현황</h2>
          <p className="text-xs text-gray-400 mt-0.5">기간별 측정 건수 추이</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400">총 측정건수</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{total.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400">최다 측정</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{max.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {period === 'daily' ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.gradient[0]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color.gradient[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0' }} />
              <Area type="monotone" dataKey="count" stroke={color.stroke} strokeWidth={2.5} fill="url(#dailyGradient)" dot={{ fill: color.stroke, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          ) : period === 'weekly' ? (
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke={color.stroke} strokeWidth={2.5} dot={{ fill: color.stroke, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill={color.fill} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
