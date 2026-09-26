import { Panel } from '@shared/ui/cards';
import { ErrorText } from '@shared/ui/feedback';

import { useDashboardAlerts } from '../model/use-dashboard-alerts';
import { ContractExpiryPanel } from './ContractExpiryPanel';
import { InspectionDuePanel } from './InspectionDuePanel';

/**
 * 대시보드 우측 "주의가 필요한 항목" 열.
 * 면·그림자를 이 열이 소유하고 내부 알림 패널은 테두리만 갖는다(중첩 그림자 방지).
 */
export const DashboardAlerts = () => {
  const { contracts, equipments, isLoading, error } = useDashboardAlerts();

  return (
    <Panel as="aside" variant="elevated" className="w-full shrink-0 lg:w-65">
      <div className="p-4">
        <h2 className="text-h3 text-ink">주의가 필요한 항목</h2>
        <ErrorText>{error}</ErrorText>
      </div>

      <ContractExpiryPanel contracts={contracts} isLoading={isLoading} />
      <InspectionDuePanel equipments={equipments} isLoading={isLoading} />
    </Panel>
  );
};
