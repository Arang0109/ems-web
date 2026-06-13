import type { WorkplaceUpdate } from "@entities/workplace";
import type { WorkplaceUpdateForm } from "./types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceUpdate = (
  form: WorkplaceUpdateForm
): WorkplaceUpdate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  zipcode: form.zipcode,
  roadAddress: form.roadAddress,
  address: trimValue(form.address),
  grade: form.grade,
})