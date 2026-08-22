import type { MeasurementCycle } from "@shared/model";

export type StackPollutantListItem = {
  id: number;
  stackId: number;
  pollutant: {
    id: number;
    /** 모든 고객사에서 동일한 전역 물질 키(예: `NOX`) */
    code: string;
    nameKr: string;
    nameEn: string;
    cycle: MeasurementCycle;
    allowance: string;
    /** 측정시설의 기준산소농도를 이 항목에 적용하는지 여부 */
    oxygenApplicable: boolean;
  };
}

export type StackPollutantUpdate = {
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정시설에 기준산소농도가 없으면 항상 false */
  oxygenApplicable: boolean;
}

export type StackPollutantCreate = {
  stackId: number;
  /** 이 고객사가 채택해 보유 중인 측정물질 id */
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정시설에 기준산소농도가 없으면 항상 false */
  oxygenApplicable: boolean;
}
