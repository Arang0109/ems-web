import type { MeasurementCycle } from "@shared/model";

export type FormRow = {
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
};

export const getDefaultRow = (): FormRow => ({
  pollutantId: 0,
  cycle: 'MONTHLY',
  allowance: '',
});
