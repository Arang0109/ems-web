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