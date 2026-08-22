import { Building2, FileText, Factory } from 'lucide-react';

import { SummaryCardGroup } from '@shared/ui/cards';

import type { OverallStats } from '../model/types';

interface Props {
  summary: OverallStats;
}

// `as const` 로 id 가 리터럴 유니온이 되어 `summary[card.id]` 가 타입 검사된다.
const CARDS = [
  { id: 'workplaceCount', label: '사업장 수', unit: '개소', icon: Building2 },
  { id: 'contractCount', label: '계약 건수', unit: '건', icon: FileText },
  { id: 'stackCount', label: '측정시설 수', unit: '개', icon: Factory },
] as const;

export const OverallStatsWidget = ({ summary }: Props) => (
  <SummaryCardGroup
    title="전체 통계"
    gridClassName="grid grid-cols-1 gap-3 md:grid-cols-2"
    items={CARDS.map((card) => ({ ...card, count: summary[card.id] }))}
  />
);
