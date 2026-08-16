import type { CellContext } from '@tanstack/react-table';

import { StatusDot } from '@shared/ui/badges';
import { SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE } from '@shared/config';
import type { ScheduleStatus } from '@shared/model';

import type { TeamScheduleTableRow } from '../model/types';

export const CustomCell = ({ getValue }: CellContext<TeamScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

export const StatusBadgeCell = ({ getValue }: CellContext<TeamScheduleTableRow, ScheduleStatus>) => {
  const status = getValue();
  return <StatusDot tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} />;
};
