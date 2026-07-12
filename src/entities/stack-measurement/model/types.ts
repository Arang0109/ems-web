import type { MeasurementCycle } from "@shared/model";

export type StackMeasurement = {
  id: number;
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackMeasurementListItem = {
  id: number;
  stackId: number;
  pollutant: {
    id: number;
    nameKr: string;
    nameEn: string;
    cycle: MeasurementCycle;
    allowance: string;
  };
}

export type StackMeasurementCreate = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
}