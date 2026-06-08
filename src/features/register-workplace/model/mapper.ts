import type { WorkplaceRegisterForm } from "./types";
import type { WorkplaceCreate } from "@entities/workplace";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceCreate = (
  form: WorkplaceRegisterForm
): WorkplaceCreate => ({
  companyId: form.companyId,
  name: trimValue(form.workplaceName),
  bizNumber: unformatNumber(form.workplaceBizNumber),
  address: trimValue(form.workplaceAddress),
});