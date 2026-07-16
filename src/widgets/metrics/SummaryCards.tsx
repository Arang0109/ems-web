import { Building2, Factory, ClipboardList, TrendingUp } from 'lucide-react';
import type { DashboardOverviewResponse } from '@entities/dashboard';

import { SummaryCard } from '@shared/ui/cards';

interface Props {
  summary: DashboardOverviewResponse;
}

const cards = [
  {
    key: 'workplaceCount' as const,
    label: '사업장 수',
    unit: '개소',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    ring: 'ring-blue-100 dark:ring-blue-500/20',
  },
  {
    key: 'stackCount' as const,
    label: '측정시설 수',
    unit: '개',
    icon: Factory,
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    ring: 'ring-violet-100 dark:ring-violet-500/20',
  },
  {
    key: 'totalMeasurements' as const,
    label: '총 측정건수',
    unit: '건',
    icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-500/20',
  },
  {
    key: 'thisMonthMeasurements' as const,
    label: '이번달 측정',
    unit: '건',
    icon: TrendingUp,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    ring: 'ring-amber-100 dark:ring-amber-500/20',
  },
];

export const SummaryCards = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {cards.map(({ key, label, unit, icon: Icon, color, ring }) => (
        <SummaryCard
          key={key}
          count={summary[key]}
          label={label}
          unit={unit}
          icon={<Icon size={20} />}
          color={color}
          ring={ring}
        />
      ))}
    </div>
  );
};
