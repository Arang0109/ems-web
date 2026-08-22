import { formatMonthDay } from '@shared/lib';
import { INSPECTION_TYPE_LABEL } from '@shared/config';

import type { InspectionDue } from '../model/types';
import { AlertPanel } from './AlertPanel';
import { DDayBadge } from './DDayBadge';

interface Props {
  equipments: InspectionDue[];
  isLoading?: boolean;
}

export const InspectionDueWidget = ({ equipments, isLoading }: Props) => (
  <AlertPanel
    title="검사 예정 장비"
    isLoading={isLoading}
    emptyMessage="검사 예정 장비가 없습니다."
    items={equipments.map((equipment) => ({
      // 한 장비가 검사 종류별로 여러 건 나오므로 equipmentId 만으로는 key가 중복된다.
      id: `${equipment.equipmentId}-${equipment.inspectionType}`,
      title: `${equipment.equipmentName} · ${INSPECTION_TYPE_LABEL[equipment.inspectionType]}`,
      caption: `${equipment.managementNumber} · ${formatMonthDay(equipment.nextDueDate)}`,
      trailing: <DDayBadge days={equipment.daysRemaining} />,
    }))}
  />
);
