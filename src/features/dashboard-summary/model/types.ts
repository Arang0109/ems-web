export interface MeasurementCountChart {
  label: string;
  count: number;
}

export interface DashboardOverview {
  workplaceCount: number;
  stackCount: number;
  totalMeasurements: number;
  thisMonthMeasurements: number;
}