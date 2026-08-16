import type { MeasurementCycle } from "@shared/model";

export type FormRow = {
  /** Select 값이므로 Form 에서는 string. Domain 변환은 mapper 가 한다. */
  pollutantId: string;
  cycle: MeasurementCycle;
  allowance: string;
  /**
   * 측정시설의 기준산소농도를 이 항목에 적용할지 여부.
   * 시설에 기준산소농도가 없으면 체크박스를 노출하지 않고 false 로 남긴다.
   */
  oxygenApplicable: boolean;
};

export const getDefaultRow = (): FormRow => ({
  pollutantId: '',
  cycle: 'MONTHLY',
  allowance: '',
  oxygenApplicable: false,
});
