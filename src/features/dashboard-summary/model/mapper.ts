import type { MeasurementCount, DashboardOverview } from "@entities/dashboard";
import type {
  MeasurementCountChart, OverallStats, MonthlyStats,
  ExpiringContract, InspectionDue,
} from "./types";

export const toMeasurementCountChart = (col: MeasurementCount): MeasurementCountChart => ({
  label: col.label,
  count: col.count,
});

export const toOverallStats = (col: DashboardOverview): OverallStats => ({
  workplaceCount: col.workplaceCount,
  contractCount: col.contractCount,
  stackCount: col.stackCount,
  totalMeasurements: col.completedMeasurementCount,
});

export const toMonthlyStats = (col: DashboardOverview): MonthlyStats => ({
  monthlyMeasurements: col.thisMonthMeasurementCount,
  newContractCount: col.newContractCount,
});

export const toExpiringContracts = (col: DashboardOverview): ExpiringContract[] =>
  (col.expiringContracts ?? []).map((item) => ({
    contractId: item.contractId,
    contractName: item.contractName,
    workplaceName: item.workplaceName,
    completionDate: item.completionDate,
    daysRemaining: item.daysRemaining,
  }));

export const toInspectionDues = (col: DashboardOverview): InspectionDue[] =>
  (col.inspectionDueEquipments ?? []).map((item) => ({
    equipmentId: item.equipmentId,
    equipmentName: item.equipmentName,
    managementNumber: item.managementNumber,
    inspectionType: item.inspectionType,
    nextDueDate: item.nextDueDate,
    daysRemaining: item.daysRemaining,
  }));
