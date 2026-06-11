import type { StackRegisterForm } from "./types";
import type { StackCreate } from "@entities/stack";

import { trimValue } from "@shared/lib";

export const toStackCreate = (
  form: StackRegisterForm
): StackCreate => ({
  workplaceId: form.workplaceId,
  field: form.field,
  name: trimValue(form.stackName),
  semsNumber: trimValue(form.semsNumber),
  grade: form.grade,
  businessCategory: trimValue(form.businessCategory),
  mainProduct: trimValue(form.mainProduct),
});