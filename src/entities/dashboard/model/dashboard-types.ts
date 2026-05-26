export interface MeasurementDataPoint {
  label: string;
  count: number;
}

export interface MeasurementStats {
  monthly: MeasurementDataPoint[];
  weekly: MeasurementDataPoint[];
  daily: MeasurementDataPoint[];
}

export interface WorkplaceByRegion {
  region: string;
  count: number;
}

export interface FacilityByType {
  type: string;
  count: number;
}

export interface DashboardSummary {
  workplaceCount: number;
  stackCount: number;
  totalMeasurements: number;
  thisMonthMeasurements: number;
  workplacesByRegion: WorkplaceByRegion[];
  stacksByType: FacilityByType[];
}
