import type { CompanyRegisterForm } from "./types";
import type { CompanyRegisterRequest } from "@entities/company";

import { stripFormatting, trimValue } from "@shared/lib/formatters";

export const mapToDto = (
  form: CompanyRegisterForm
): CompanyRegisterRequest => ({
  name: trimValue(form.name),
  bizNumber: stripFormatting(form.bizNumber),
  representative: trimValue(form.representative),
  address: trimValue(form.address),
  manager: trimValue(form.manager),
  email: trimValue(form.email),
  tel: stripFormatting(form.tel),
});