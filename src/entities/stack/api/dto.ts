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
  height: string;
  horizontalLength: string;
  verticalLength: string;
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
  companyName: string,
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

export type TargetSubstanceResponse = {
  id: number;
  name: string;
  removalEfficiency: string;
}

export type PreventionResponse = {
  id: number;
  stackId: number;
  name: string;
  targets: TargetSubstanceResponse[];
}

export type FacilityResponse = {
  id: number;
  stackId: number;
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type FacilityRegisterRequest = {
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type FacilityUpdateRequest = {
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type PreventionRegisterRequest = {
  name: string;
}

export type PreventionUpdateRequest = {
  name: string;
}

export type TargetSubstanceRegisterRequest = {
  name: string;
  removalEfficiency: string;
}