import type { DashboardOverview } from "@entities/dashboard";

import type { MonthlyStats, OverallStats } from "./types";

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
