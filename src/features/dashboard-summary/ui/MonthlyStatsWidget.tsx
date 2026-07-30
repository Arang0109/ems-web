import { ClipboardList } from 'lucide-react';

import { SummaryCard } from '@shared/ui/cards';
import type { MonthlyStats } from '../model/types';

interface Props {
  summary: MonthlyStats | null;
}

const cards = [
  {
    key: 'monthlyMeasurements' as const,
    label: '월간 측정건수',
    unit: '건',
    icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-500/20',
  },
];

export const MonthlyStatsWidget = ({ summary }: Props) => {
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
            count={summary?.monthlyMeasurements ?? 0}
            label={label}
            unit={unit}
            icon={Icon}
          />
        ))}
      </div>
    </div>
  );
};
