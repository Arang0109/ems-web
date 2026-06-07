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

export type StackCreate = {
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
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
