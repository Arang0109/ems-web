import type { MeasurementCountChartResponse, DashboardOverviewResponse } from "@entities/dashboard";
import type { MeasurementCountChart, OverallStats, MonthlyStats } from "./types";

export const toMeasurementCountChart = (col: MeasurementCountChartResponse): MeasurementCountChart => ({
  label: col.label,
  count: col.count,
});

export const toOverallStats = (col: DashboardOverviewResponse): OverallStats => ({
  workplaceCount: col.workplaceCount,
  stackCount: col.stackCount,
  totalMeasurements: col.totalMeasurements,
});

export const toMonthlyStats = (col: DashboardOverviewResponse): MonthlyStats => ({
  monthlyMeasurements: col.thisMonthMeasurements,
});