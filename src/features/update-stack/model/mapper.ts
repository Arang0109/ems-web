import type { StackUpdate } from "@/entities/stack/model/types";
import type { StackUpdateForm } from "./types";
import { trimValue } from "@/shared/lib";


export const toStackUpdate = (
  form: StackUpdateForm
): StackUpdate => ({
  field: form.field,
  name: trimValue(form.name),
  semsNumber: trimValue(form.semsNumber),
  grade: form.grade,
  businessCategory: trimValue(form.businessCategory),
  mainProduct: trimValue(form.mainProduct),
  height: trimValue(form.height),
  horizontalLength: trimValue(form.horizontalLength),
  verticalLength: trimValue(form.verticalLength),
  shape: form.shape,
  orientation: form.orientation
})