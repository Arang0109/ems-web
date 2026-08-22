import type { WorkplaceUpdate } from "@entities/workplace";
import type { WorkplaceUpdateForm } from "./types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceUpdate = (
  form: WorkplaceUpdateForm
): WorkplaceUpdate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  businessCategory: trimValue(form.businessCategory),
  zipcode: form.zipcode,
  roadAddress: form.roadAddress,
  address: trimValue(form.address),
  facilityManager: trimValue(form.facilityManager),
  samplingWitness: trimValue(form.samplingWitness),
  grade: form.grade,
})