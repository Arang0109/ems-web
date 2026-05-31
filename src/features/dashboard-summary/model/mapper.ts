import type { MeasurementCountChartResponse, DashboardOverviewResponse } from "@entities/dashboard";
import type { MeasurementCountChart, DashboardOverview } from "./types";

export const toMeasurementCountChart = (col: MeasurementCountChartResponse): MeasurementCountChart => ({
  label: col.label,
  count: col.count,
});

export const toDashboardOverview = (col: DashboardOverviewResponse): DashboardOverview => ({
  workplaceCount: col.workplaceCount,
  stackCount: col.stackCount,
  totalMeasurements: col.totalMeasurements,
  thisMonthMeasurements: col.thisMonthMeasurements,
});