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

/**
 * 서버는 전달하지 않은(또는 빈 문자열인) 필드를 기존 값으로 유지한다.
 * 프론트 폼은 전체 필드를 채워 보내므로 부분 갱신을 따로 다루지 않는다.
 */
export type PollutantUpdateRequest = {
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