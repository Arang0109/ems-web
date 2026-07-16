import type { MeasurementCycle } from "@shared/model";

export type StackPollutantRegisterRequest = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
}

export type StackPollutantResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackPollutantTableResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
}

export type StackPollutantBatchRegisterRequest = StackPollutantRegisterRequest[];
export type StackPollutantBatchResponse = StackPollutantResponse[];