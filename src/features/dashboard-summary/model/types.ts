export interface MeasurementCountChart {
  label: string;
  count: number;
}

export interface OverallStats {
  workplaceCount: number;
  stackCount: number;
  totalMeasurements: number;
}

export interface MonthlyStats {
  monthlyMeasurements: number;
}