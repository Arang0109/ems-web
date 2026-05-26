import { Building2, Factory, ClipboardList, TrendingUp } from 'lucide-react';
import type { DashboardSummary } from '@/entities/dashboard/model/dashboard-types';

interface Props {
  summary: DashboardSummary;
}

const cards = [
  {
    key: 'workplaceCount' as const,
    label: '사업장 수',
    unit: '개소',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600',
    ring: 'ring-blue-100',
  },
  {
    key: 'facilityCount' as const,
    label: '측정시설 수',
    unit: '개',
    icon: Factory,
    color: 'bg-violet-50 text-violet-600',
    ring: 'ring-violet-100',
  },
  {
    key: 'totalMeasurements' as const,
    label: '총 측정건수',
    unit: '건',
    icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-600',
    ring: 'ring-emerald-100',
  },
  {
    key: 'thisMonthMeasurements' as const,
    label: '이번달 측정',
    unit: '건',
    icon: TrendingUp,
    color: 'bg-amber-50 text-amber-600',
    ring: 'ring-amber-100',
  },
];

export const SummaryCards = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ key, label, unit, icon: Icon, color, ring }) => (
        <div
          key={key}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-2 shrink-0 ${color} ${ring}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{label}</p>
            <p className="text-2xl font-bold text-gray-800 leading-tight">
              {summary[key].toLocaleString()}
              <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
