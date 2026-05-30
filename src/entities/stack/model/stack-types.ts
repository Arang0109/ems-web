import type { MeasurementField, Grade } from "@shared/model";

export type StackRegisterForm = {
  field: MeasurementField,
  name: string,
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
}

export const getDefaultStackRegisterForm = (): StackRegisterForm => ({
  field: "air",
  name: "",
  semsNumber: "",
  grade: "TYPE_1",
  businessCategory: "",
  mainProduct: "",
});