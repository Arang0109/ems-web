import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

export type PollutantRegisterRequest = {
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  method: MeasurementMethod,
  phase: PollutantPhase,
  equipment: string,
  testMethod: string
}

export type PollutantResponse = {
  id: number,
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  method: MeasurementMethod,
  phase: PollutantPhase,
  equipment: string,
  testMethod: string
}