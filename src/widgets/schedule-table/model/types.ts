import type { ScheduleStatus } from "@shared/model";

export type ScheduleTableRow = {
  id: string;
  measureDate: string;        // yyyy-MM-dd
  status: ScheduleStatus;     // 배지 렌더링용 원본 값
  referenceNumber: string;
  measurementField: string;   // 표시 라벨
  measurementType: string;    // 표시 라벨
  clientName: string;
  stackName: string;
  teamName: string;
};
