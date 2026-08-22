import type { MeasurementCycle } from "@shared/model";

export type FormRow = {
  /**
   * 선택한 측정물질 id(문자열). Select 값이라 문자열로 들고 있다가 mapper 가 숫자로 바꾼다.
   *
   * 목록에는 이 고객사가 채택한 물질만 오므로 숫자 id 하나로 지목할 수 있다.
   * 원하는 물질이 없으면 측정물질 관리에서 먼저 등록해야 한다.
   */
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
