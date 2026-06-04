import {
  MEASUREMENT_FIELD_LABEL, MEASUREMENT_FIELD,
  GRADE_LABEL, GRADE,
} from "@shared/model";

import type { Workplace } from "@entities/workplace";
import type { MeasurementField, Grade } from "@shared/model";

export const measurementFieldOptions = MEASUREMENT_FIELD.map((field) => ({
  value: field,
  label: MEASUREMENT_FIELD_LABEL[field],
}));

export const gradeOptions = GRADE.map((grade) => ({
  value: grade,
  label: GRADE_LABEL[grade]
}))

export type StackRegisterForm = {
  workplaceId: number,
  wokrplaceName: string,
  field: MeasurementField,
  stackName: string,
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
}

export const getDefaultStackRegisterForm = (workplace?: Workplace | null): StackRegisterForm => ({
  workplaceId: workplace?.id ?? 0,
  wokrplaceName: workplace?.name ?? "",
  field: "AIR",
  stackName: "",
  semsNumber: "",
  grade: "TYPE_1",
  businessCategory: "",
  mainProduct: "",
});