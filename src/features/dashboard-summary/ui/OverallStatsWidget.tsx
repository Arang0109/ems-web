import { Building2, Factory, ClipboardList } from 'lucide-react';
import { SummaryCard } from '@shared/ui/cards';
import type { OverallStats } from '../model/types';

interface Props {
  summary: OverallStats;
}

const cards = [
  {
    key: 'workplaceCount' as const,
    label: '사업장 수',
    unit: '개소',
    icon: Building2,
    color: 'text-brand-primary dark:bg-blue-500/15 dark:text-blue-400',
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
    label: '측정건수',
    unit: '건',
    icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-500/20',
  },
];

export const OverallStatsWidget = ({ summary }: Props) => {
  return (
    <div className="
      p-4 space-y-2
      bg-surface shadow-sm
      rounded-panel ring-1 ring-rule">
      <p className="text-body-1 text-link-soft">전체통계 <span className="text-caption text-muted-ink">(SummaryCards.tsx 작업영역)</span></p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {cards.map(({ key, label, unit, icon: Icon }) => (
          <SummaryCard
            key={key}
            count={summary[key]}
            label={label}
            unit={unit}
            icon={Icon}
          />
        ))}
      </div>
    </div>
  );
};
