import { ClipboardList, FilePlus } from 'lucide-react';

import { SummaryCardGroup } from '@shared/ui/cards';

import type { MonthlyStats } from '../model/types';

interface Props {
  summary: MonthlyStats;
}

const CARDS = [
  { id: 'monthlyMeasurements', label: '월간 측정건수', unit: '건', icon: ClipboardList },
  { id: 'newContractCount', label: '신규 계약', unit: '건', icon: FilePlus },
] as const;

export const MonthlyStatsWidget = ({ summary }: Props) => (
  <SummaryCardGroup
    title="이번달 통계"
    gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
    items={CARDS.map((card) => ({ ...card, count: summary[card.id] }))}
  />
);
