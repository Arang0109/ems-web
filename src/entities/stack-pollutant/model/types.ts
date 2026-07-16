import type { MeasurementCycle } from "@shared/model";

export type StackPollutantListItem = {
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

export type StackPollutantCreate = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
}