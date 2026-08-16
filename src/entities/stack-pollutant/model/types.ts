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
    /** 측정시설의 기준산소농도를 이 항목에 적용하는지 여부 */
    oxygenApplicable: boolean;
  };
}

export type StackPollutantCreate = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정시설에 기준산소농도가 없으면 항상 false */
  oxygenApplicable: boolean;
}