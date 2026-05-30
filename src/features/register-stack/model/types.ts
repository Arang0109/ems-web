import {
  MEASUREMENT_FIELD_LABEL, MEASUREMENT_FIELD,
  GRADE_LABEL, GRADE,
} from "@shared/model";

export const measurementFieldOptions = MEASUREMENT_FIELD.map((field) => ({
  value: field,
  label: MEASUREMENT_FIELD_LABEL[field],
}));

export const gradeOptions = GRADE.map((grade) => ({
  value: grade,
  label: GRADE_LABEL[grade]
}))