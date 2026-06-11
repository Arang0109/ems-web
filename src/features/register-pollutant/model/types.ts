import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

import { MEASUREMENT_FIELD, MEASUREMENT_METHOD, POLLUTANT_PHASE } from "@shared/model";
import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL } from "@shared/config"

export const measurementFieldOptions = MEASUREMENT_FIELD.map((field) => ({
  value: field,
  label: MEASUREMENT_FIELD_LABEL[field],
}));

export const measurementMethodOptions = MEASUREMENT_METHOD.map((method) => ({
  value: method,
  label: MEASUREMENT_METHOD_LABEL[method],
}));

export const pollutantPhaseOptions = POLLUTANT_PHASE.map((phase) => ({
  value: phase,
  label: POLLUTANT_PHASE_LABEL[phase],
}));

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