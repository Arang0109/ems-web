import type { ClientRegisterForm } from "./types";
import type { ClientCreate } from "@entities/client";

import { unformatNumber, trimValue } from "@shared/lib";

export const toClientCreate = (
  form: ClientRegisterForm
): ClientCreate => ({
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