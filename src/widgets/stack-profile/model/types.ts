export type StackProfile = {
  field: string;
  name: string;
  semsNumber: string;
  grade: string;
  businessCategory: string;
  mainProduct: string;
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
}