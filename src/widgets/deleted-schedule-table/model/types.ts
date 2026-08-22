import type { ScheduleStatus } from "@shared/model";

export type DeletedScheduleTableRow = {
  id: string;
  measureDate: string;        // yyyy-MM-dd
  status: ScheduleStatus;     // 삭제 시점에 보존된 상태 — 배지 렌더링용 원본 값
  referenceNumber: string;
  clientName: string;
  workplaceName: string;
  stackName: string;
  teamName: string;
  deletedAt: string;          // yyyy-MM-dd
};
