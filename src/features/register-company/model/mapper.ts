import type { CompanyRegisterForm } from "./register-company-types";
import type { CompanyRegisterRequest } from "@entities/company";

import { stripFormatting, trimValue } from "@shared/lib/formatters";

export const mapToDto = (
  form: CompanyRegisterForm
): CompanyRegisterRequest => ({
  name: trimValue(form.name),
  bizNumber: stripFormatting(form.bizNumber),
  ceoName: trimValue(form.ceoName),
  address: trimValue(form.address),
  manager: trimValue(form.manager),
  email: trimValue(form.email),
  tell: stripFormatting(form.tell),
});