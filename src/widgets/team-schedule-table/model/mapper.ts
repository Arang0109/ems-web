import type { ScheduleListItem } from '@entities/schedule';
import { MEASUREMENT_FIELD_LABEL } from '@shared/config';

import type { TeamScheduleTableRow } from './types';

export const toTeamScheduleRows = (row: ScheduleListItem): TeamScheduleTableRow => ({
  scheduleId: row.id,
  teamName: row.teamName ?? '',
  workplaceName: row.clientName ?? '',
  stackName: row.stackName ?? '',
  field: MEASUREMENT_FIELD_LABEL[row.measurementField],
  status: row.status,
});
