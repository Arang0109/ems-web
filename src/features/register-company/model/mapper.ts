import type { CompanyRegisterForm } from "./types";
import type { CompanyCreate } from "@entities/company";

import { unformatNumber, trimValue } from "@shared/lib";

export const toCompanyCreate = (
  form: CompanyRegisterForm
): CompanyCreate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  representative: trimValue(form.representative),
  address: trimValue(form.address),
  manager: trimValue(form.manager),
  email: trimValue(form.email),
  tel: unformatNumber(form.tel),
});