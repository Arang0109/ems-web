import type { Pollutant } from "@entities/pollutant";
import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

export type PollutantUpdateForm = {
  field: MeasurementField;
  nameKr: string;
  nameEn: string;
  method: MeasurementMethod;
  phase: PollutantPhase;
  equipment: string;
  testMethod: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (pollutant: Pollutant | null): PollutantUpdateForm => ({
  field: pollutant?.field ?? "AIR",
  nameKr: pollutant?.nameKr ?? "",
  nameEn: pollutant?.nameEn ?? "",
  method: pollutant?.method ?? "DUST",
  phase: pollutant?.phase ?? "PARTICLE",
  equipment: pollutant?.equipment ?? "",
  testMethod: pollutant?.testMethod ?? "",
});
