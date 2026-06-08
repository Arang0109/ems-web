import type { WorkplaceUpdate } from "@entities/workplace";
import type { WorkplaceUpdateForm } from "./types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceUpdate = (
  form: WorkplaceUpdateForm
): WorkplaceUpdate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  address: trimValue(form.address),
})