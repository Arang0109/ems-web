import type { MeasurementField, Grade } from "@shared/model"

export type StackRegisterRequest = {
  workplaceId: number;
  field: MeasurementField,
  name: string,
  semsNumber: string,
  grade: Grade,
  businessCategory: string,
  mainProduct: string,
}

export type StackListResponse = {
  id: number,
  companyName: string,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  createdAt: string,
  modifiedAt: string,
}