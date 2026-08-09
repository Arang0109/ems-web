import type { MeasurementCycle } from "@shared/model";

export type FormRow = {
  /** Select 값이므로 Form 에서는 string. Domain 변환은 mapper 가 한다. */
  pollutantId: string;
  cycle: MeasurementCycle;
  allowance: string;
};

export const getDefaultRow = (): FormRow => ({
  pollutantId: '',
  cycle: 'MONTHLY',
  allowance: '',
});
