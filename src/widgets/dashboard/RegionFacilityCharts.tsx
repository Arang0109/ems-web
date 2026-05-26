import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import type { DashboardSummary } from '@/entities/dashboard/model/dashboard-types';

interface Props {
  summary: DashboardSummary;
}

const REGION_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
const FACILITY_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500">{payload[0].name}</p>
        <p className="text-lg font-bold text-gray-800">{payload[0].value}<span className="text-xs font-normal text-gray-400 ml-1">개</span></p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const RegionFacilityCharts = ({ summary }: Props) => {
  const regionTotal = summary.workplacesByRegion.reduce((s, d) => s + d.count, 0);
  const facilityTotal = summary.facilitiesByType.reduce((s, d) => s + d.count, 0);

  const radialData = summary.facilitiesByType.map((d, i) => ({
    name: d.type,
    value: Math.round((d.count / facilityTotal) * 100),
    fill: FACILITY_COLORS[i % FACILITY_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 사업장 지역 분포 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">사업장 지역 분포</h2>
          <p className="text-xs text-gray-400 mt-0.5">총 {regionTotal}개소</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-44 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.workplacesByRegion}
                  dataKey="count"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={CustomLabel}
                >
                  {summary.workplacesByRegion.map((_, i) => (
                    <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {summary.workplacesByRegion.map((d, i) => (
              <div key={d.region} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }} />
                <span className="text-xs text-gray-600 w-8">{d.region}</span>
                <span className="text-xs font-semibold text-gray-800">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 측정시설 종류 분포 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">측정시설 종류 분포</h2>
          <p className="text-xs text-gray-400 mt-0.5">총 {facilityTotal}개</p>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={80}
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#f8fafc' }} />
              <Legend
                iconSize={8}
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, '비율']}
                contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {summary.facilitiesByType.map((d, i) => (
            <div key={d.type} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: FACILITY_COLORS[i % FACILITY_COLORS.length] }} />
                <span className="text-xs text-gray-600">{d.type}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{d.count}개</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
