export interface MeasurementDataPoint {
  label: string;
  count: number;
}

export interface DashboardSummary {
  workplaceCount: number;
  stackCount: number;
  totalMeasurements: number;
  thisMonthMeasurements: number;
}
