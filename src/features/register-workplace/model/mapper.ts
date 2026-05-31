import type { WorkplaceRegisterForm } from "./types";
import type { WorkplaceRegisterRequest } from "@entities/workplace";

import { stripFormatting, trimValue } from "@shared/lib/formatters";

export const mapToDto = (
  form: WorkplaceRegisterForm
): WorkplaceRegisterRequest => ({
  companyId: form.companyId,
  name: trimValue(form.workplaceName),
  bizNumber: stripFormatting(form.workplaceBizNumber),
  address: trimValue(form.workplaceAddress),
});