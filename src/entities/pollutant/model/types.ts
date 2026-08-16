import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

export type Pollutant = {
  id: number,
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  method: MeasurementMethod,
  phase: PollutantPhase,
  equipment: string,
  testMethod: string
}

export type PollutantCreate = {
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  method: MeasurementMethod,
  phase: PollutantPhase,
  equipment: string,
  testMethod: string
}

export type PollutantUpdate = {
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  method: MeasurementMethod,
  phase: PollutantPhase,
  equipment: string,
  testMethod: string
}