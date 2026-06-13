import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";

export type Stack = {
  id: number,
  workplaceId: number;
  field: MeasurementField,
  name: string,
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

export const getStackDefault = (): Stack => ({
  id: 0,
  workplaceId: 0,
  field: 'AIR' as MeasurementField,
  name: '',
  semsNumber: '',
  grade: 'TYPE_1' as Grade,
  businessCategory: '',
  mainProduct: '',
  height: '',
  horizontalLength: '',
  verticalLength: '',
  shape: 'CIRCULAR' as Shape,
  orientation: 'VERTICAL' as Orientation,
  createdAt: new Date(),
  modifiedAt: new Date(),
});

export type StackCreate = {
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
}

export type StackUpdate = {
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

export type StackListItem = {
  id: number,
  companyName: string,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  createdAt: string,
  modifiedAt: string,
}

export type StackDetail = {
  stack: Stack,
  preventions: Prevention[];
  facilities: Facility[];
}

export const getStackDetailDefault = (): StackDetail => ({
  stack: getStackDefault(),
  preventions: [],
  facilities: [],
});

export type Prevention = {
  id: number;
  name: string;
  targets: TargetSubstance[];
}

export type TargetSubstance = {
  id: number;
  name: string;
  removalEfficiency: string;
}

export type Facility = {
  id: number;
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type FacilityCreate = {
  stackId: number;
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type FacilityUpdate = {
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
}

export type PreventionCreate = {
  stackId: number;
  name: string;
}

export type PreventionUpdate = {
  name: string;
}

export type TargetSubstanceCreate = {
  preventionId: number;
  name: string;
  removalEfficiency: string;
}