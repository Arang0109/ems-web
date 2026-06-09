import type { MeasurementCycle } from "@shared/model";

export type StackMeasurementRegisterRequest = {
  stack_id: number;
  pollutant_id: number;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackMeasurementResponse = {
  id: number;
  stack_id: number;
  pollutant_id: number;
  cycle: MeasurementCycle;
  allowance: string;
}