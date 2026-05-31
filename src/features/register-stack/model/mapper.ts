import type { StackRegisterForm } from "./types";
import type { StackRegisterRequest } from "@entities/stack";

import { trimValue } from "@shared/lib/formatters";

export const mapToDto = (
  form: StackRegisterForm
): StackRegisterRequest => ({
  workplaceId: form.workplaceId,
  field: form.field,
  name: trimValue(form.stackName),
  semsNumber: trimValue(form.semsNumber),
  grade: form.grade,
  businessCategory: trimValue(form.businessCategory),
  mainProduct: trimValue(form.mainProduct),
})