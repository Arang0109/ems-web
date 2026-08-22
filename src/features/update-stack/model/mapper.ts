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
  mainProduct: trimValue(form.mainProduct),
  // 서버가 nullable(Integer)이라 빈 입력은 0이 아니라 null(= 기존 값 유지)로 보낸다.
  standardOxygen: toNumberOrNull(form.standardOxygen),
  height: toNumberOrNull(form.height),
  horizontalLength: toNumberOrNull(form.horizontalLength),
  verticalLength: toNumberOrNull(form.verticalLength),
  shape: form.shape,
  orientation: form.orientation
})