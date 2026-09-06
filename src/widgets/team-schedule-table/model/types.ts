import type { ScheduleStatus } from '@shared/model';

export type TeamScheduleTableRow = {
  scheduleId: number;
  teamName: string; // 담당 팀
  stackName: string;
  field: string;
  status: ScheduleStatus;
}
