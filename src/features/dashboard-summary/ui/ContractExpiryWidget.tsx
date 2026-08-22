import { formatMonthDay } from '@shared/lib';

import type { ExpiringContract } from '../model/types';
import { AlertPanel } from './AlertPanel';
import { DDayBadge } from './DDayBadge';

interface Props {
  contracts: ExpiringContract[];
  isLoading?: boolean;
}

export const ContractExpiryWidget = ({ contracts, isLoading }: Props) => (
  <AlertPanel
    title="계약 만료 임박"
    isLoading={isLoading}
    emptyMessage="만료 임박 계약이 없습니다."
    items={contracts.map((contract) => ({
      id: String(contract.contractId),
      title: contract.contractName,
      caption: `${contract.workplaceName} · ${formatMonthDay(contract.completionDate)}`,
      trailing: <DDayBadge days={contract.daysRemaining} />,
    }))}
  />
);
