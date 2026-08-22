import type { InspectionType } from "@shared/model";

export interface MeasurementCountChart {
  label: string;
  count: number;
}

export interface OverallStats {
  workplaceCount: number;
  contractCount: number;
  stackCount: number;
  totalMeasurements: number;
}

export interface MonthlyStats {
  monthlyMeasurements: number;
  newContractCount: number;
}

/** 만료 임박 계약. `daysRemaining` 은 서버 정의상 항상 0 이상이다. */
export interface ExpiringContract {
  contractId: number;
  contractName: string;
  workplaceName: string;
  completionDate: string;
  daysRemaining: number;
}

/**
 * 검사 예정일 임박 항목. `daysRemaining` 은 기한이 지났으면 음수다.
 * 단위가 "장비-검사항목"이라 한 장비가 검사 종류 수만큼 나올 수 있다.
 */
export interface InspectionDue {
  equipmentId: string;
  equipmentName: string;
  managementNumber: string;
  inspectionType: InspectionType;
  nextDueDate: string;
  daysRemaining: number;
}
