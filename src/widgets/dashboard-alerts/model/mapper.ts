import type { DashboardOverview } from "@entities/dashboard";

import type { ExpiringContract, InspectionDue } from "./types";

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
