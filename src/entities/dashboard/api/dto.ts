import type { InspectionType } from "@shared/model";

export interface MeasurementCountChartResponse {
  label: string;
  count: number;
}

/** 만료 임박 계약 항목. `daysRemaining` 은 정의상 항상 0 이상이다. */
export interface ExpiringContractResponse {
  contractId: number;
  contractName: string;
  workplaceName: string;
  completionDate: string;
  daysRemaining: number;
}

/**
 * 검사 예정일이 임박한 장비 항목. `daysRemaining` 은 기한이 지났으면 음수다.
 *
 * 단위가 장비가 아니라 "장비-검사항목"이라, 한 장비가 여러 검사에서 임박하면
 * `equipmentId` 가 같은 항목이 검사 종류 수만큼 나온다.
 */
export interface InspectionDueResponse {
  equipmentId: string;
  equipmentName: string;
  managementNumber: string;
  inspectionType: InspectionType;
  inspectionTypeLabel: string;
  nextDueDate: string;
  daysRemaining: number;
}

export interface DashboardOverviewResponse {
  workplaceCount: number;
  contractCount: number;
  stackCount: number;

  completedMeasurementCount: number;
  thisMonthMeasurementCount: number;
  newContractCount: number;

  expiringContracts: ExpiringContractResponse[];
  inspectionDueEquipments: InspectionDueResponse[];
}
