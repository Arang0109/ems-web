import type { MeasurementCycle } from "@shared/model";

export type StackPollutantRegisterRequest = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정시설의 기준산소농도를 이 항목에 적용할지 여부 — 서버 계약이 primitive boolean(nullable 아님) */
  oxygenApplicable: boolean;
}

export type StackPollutantResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
}

export type StackPollutantTableResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
}

export type StackPollutantBatchRegisterRequest = StackPollutantRegisterRequest[];
export type StackPollutantBatchResponse = StackPollutantResponse[];