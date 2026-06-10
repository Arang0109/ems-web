import type { CompanyUpdateForm } from "./types";
import type { CompanyUpdate } from "@entities/company";

import { unformatNumber, trimValue } from "@shared/lib";

export const toCompanyUpdate = (
  form: CompanyUpdateForm
): CompanyUpdate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  representative: trimValue(form.representative),
  zipcode: form.zipcode,
  roadAddress: form.roadAddress,
  address: trimValue(form.address),
  manager: trimValue(form.manager),
  email: trimValue(form.email),
  tel: unformatNumber(form.tel),
});