import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model"

export type StackRegisterRequest = {
  workplaceId: number;
  field: MeasurementField,
  name: string,
  semsNumber: string,
  grade: Grade,
  businessCategory: string,
  mainProduct: string,
}

export type StackUpdateRequest = {
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
  /** 서버 `UpdateStackRequest` 는 Double(nullable). 응답(`StackResponse`)은 String 이라 읽기/쓰기가 비대칭이다. */
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
}

export type StackResponse = {
  id: number;
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  createdAt: Date;
  modifiedAt: Date;
}

export type StackListResponse = {
  id: number,
  clientName: string,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  createdAt: string,
  modifiedAt: string,
}

export type StackDetailResponse = {
  id: number;
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  createdAt: Date;
  modifiedAt: Date;

  preventions: PreventionResponse[];
  facilities: FacilityResponse[];
}

export type PreventionResponse = {
  id: number;
  stackId: number;
  name: string;
  capacity: number | null;
  targetName: string | null;
  removalEfficiency: string | null;
}

export type FacilityResponse = {
  id: number;
  stackId: number;
  name: string;
  fuelUsage: string | null;
  productOutput: string | null;
  incinerationAmount: string | null;
  fuelInput: string | null;
  fuelType: string | null;
  unit: string | null;
}

export type FacilityRegisterRequest = {
  stackId: number;
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type FacilityUpdateRequest = {
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type PreventionRegisterRequest = {
  stackId: number;
  name: string;
  capacity: number | null;
  targetName: string;
  removalEfficiency: string;
}

export type PreventionUpdateRequest = {
  name: string;
  capacity: number | null;
  targetName: string;
  removalEfficiency: string;
}