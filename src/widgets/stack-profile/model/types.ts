export type StackProfile = {
  field: string;
  name: string;
  semsNumber: string;
  grade: string;
  mainProduct: string;
  standardOxygen: string;
  height: string;
  diameter: string; // v + h (shape 에 따라 바뀜)
  shape: string;
  orientation: string;
}

export type MeasurementProfile = {
  nameKr: string;
  nameEn: string;
  cycle: string;
  allowance: string;
  /** 기준산소농도 적용 여부의 표시 문자열 */
  oxygenApplicable: string;
}