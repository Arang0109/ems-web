import type { MeasurementCycle } from "@shared/model";

export type StackMeasurementRegisterRequest = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
}

export type StackMeasurementResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackMeasurementTableResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackMeasurementBatchRegisterRequest = StackMeasurementRegisterRequest[];
export type StackMeasurementBatchResponse = StackMeasurementResponse[];