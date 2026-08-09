import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

export type PollutantRegisterForm = {
  field: MeasurementField;
  nameKr: string;
  nameEn: string;
  method: MeasurementMethod;
  phase: PollutantPhase;
  equipment: string;
  testMethod: string;
}

export const getDefaultForm = (): PollutantRegisterForm => ({
  field: "AIR",
  nameKr: "",
  nameEn: "",
  method: "DUST",
  phase: "PARTICLE",
  equipment: "",
  testMethod: "",
});