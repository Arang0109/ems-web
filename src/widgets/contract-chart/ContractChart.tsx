import { Clock3, Files, CalendarClock, FileX } from 'lucide-react';

import type { ContractOverview } from '@entities/company';
import { SummaryCard } from '@/shared/ui/cards';

interface Props {
  summary: ContractOverview
}

const cards = [
  {
    key: 'recentContractCount' as const,
    label: '최근 계약 (최근 1개월)',
    unit: '건',
    icon: Clock3,
  },
  {
    key: 'totalContractCount' as const,
    label: '총 계약건수',
    unit: '건',
    icon: Files,
    color: 'bg-violet-50 text-violet-600',
    ring: 'ring-violet-100',
  },
  {
    key: 'expiringSoonContractCount' as const,
    label: '만료 예정 (1개월 이하)',
    unit: '건',
    icon: CalendarClock,
    color: 'bg-orange-50 text-orange-600',
    ring: 'ring-orange-100',
  },
  {
    key: 'expiredContractCount' as const,
    label: '계약 만료',
    unit: '건',
    icon: FileX,
    color: 'bg-red-50 text-red-600',
    ring: 'ring-red-100',
  }
]

export const ContractChart = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {cards.map(({ key, label, unit, icon: Icon, color, ring }) => (
        <SummaryCard
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
}