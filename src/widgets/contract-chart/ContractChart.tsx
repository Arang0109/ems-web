import { Clock3, Files, CalendarClock, FileX } from 'lucide-react';

import type { ContractOverview } from '@entities/workplace';
import { SummaryCardGroup } from '@shared/ui/cards';

interface Props {
  summary: ContractOverview
}

// 색상은 SummaryCard가 디자인 토큰으로 통일해 관리한다(카드별 색 스킴 없음).
const CARDS = [
  { id: 'recentContractCount', label: '최근 계약 (최근 1개월)', unit: '건', icon: Clock3 },
  { id: 'totalContractCount', label: '총 계약건수', unit: '건', icon: Files },
  { id: 'expiringSoonContractCount', label: '만료 예정 (1개월 이하)', unit: '건', icon: CalendarClock },
  { id: 'expiredContractCount', label: '계약 만료', unit: '건', icon: FileX },
] as const;

export const ContractChart = ({ summary }: Props) => (
  <SummaryCardGroup
    gridClassName="grid grid-cols-1 gap-4 lg:grid-cols-4"
    items={CARDS.map((card) => ({ ...card, count: summary[card.id] }))}
  />
);
