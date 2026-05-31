export interface MeasurementCountChartResponse {
  label: string;
  count: number;
}

export interface DashboardOverviewResponse {
  workplaceCount: number;
  stackCount: number;
  totalMeasurements: number;
  thisMonthMeasurements: number;
}