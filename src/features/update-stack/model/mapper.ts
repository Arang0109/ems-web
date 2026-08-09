import type { StackUpdate } from "@entities/stack";
import type { StackUpdateForm } from "./types";
import { toNumberOrNull, trimValue } from "@shared/lib";


export const toStackUpdate = (
  form: StackUpdateForm
): StackUpdate => ({
  field: form.field,
  name: trimValue(form.name),
  semsNumber: trimValue(form.semsNumber),
  grade: form.grade,
  businessCategory: trimValue(form.businessCategory),
  mainProduct: trimValue(form.mainProduct),
  height: toNumberOrNull(form.height),
  horizontalLength: toNumberOrNull(form.horizontalLength),
  verticalLength: toNumberOrNull(form.verticalLength),
  shape: form.shape,
  orientation: form.orientation
})