import type { ScheduleStatus } from "@shared/model";

export type ScheduleTableRow = {
  id: string;
  measureDate: string;        // yyyy-MM-dd
  /** 측정일이 오늘인가 — 모바일 카드의 "오늘" 배지·강조 테두리 판정 */
  isToday: boolean;
  status: ScheduleStatus;     // 배지 렌더링용 원본 값
  referenceNumber: string;
  measurementField: string;   // 표시 라벨
  clientName: string;
  stackName: string;
  teamName: string;
};
