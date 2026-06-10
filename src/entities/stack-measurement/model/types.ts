import type { MeasurementCycle } from "@shared/model";

export type StackMeasurement = {
  id: number;
  stack_id: number;
  pollutant_id: number;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackMeasurementListItem = {
  id: number;
  stack_id: number;
  pollutant: {
    id: number;
    nameKr: string;
    nameEn: string;
    cycle: MeasurementCycle;
    allowance: string;
  };
}