import {
  ContractExpiryWidget, InspectionDueWidget,
  type ExpiringContract, type InspectionDue,
} from '@features/dashboard-summary';

interface Props {
  contracts: ExpiringContract[];
  equipments: InspectionDue[];
  isLoading?: boolean;
}

/**
 * 대시보드 우측 "주의가 필요한 항목" 열.
 * 면·그림자를 이 열이 소유하고 내부 알림 패널은 테두리만 갖는다(중첩 그림자 방지).
 */
export const DashboardAlerts = ({ contracts, equipments, isLoading }: Props) => (
  <aside className="w-full shrink-0 overflow-hidden rounded-panel bg-surface shadow-panel ring-1 ring-rule lg:w-65">
    <div className="p-4">
      <h2 className="text-h3 text-ink">주의가 필요한 항목</h2>
    </div>

    <ContractExpiryWidget contracts={contracts} isLoading={isLoading} />
    <InspectionDueWidget equipments={equipments} isLoading={isLoading} />
  </aside>
);
