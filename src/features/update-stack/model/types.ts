import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";

export type StackUpdateForm = {
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
}

export const getDefaultForm = (): StackUpdateForm => ({
  field: "AIR",
  name: "",
  semsNumber: "",
  grade: "TYPE_1",
  mainProduct: "",
  standardOxygen: "",
  height: "",
  horizontalLength: "",
  verticalLength: "",
  shape: "CIRCULAR",
  orientation: "VERTICAL"
})