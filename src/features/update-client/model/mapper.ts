import type { ClientUpdateForm } from "./types";
import type { ClientUpdate } from "@entities/client";

import { unformatNumber, trimValue } from "@shared/lib";

export const toClientUpdate = (
  form: ClientUpdateForm
): ClientUpdate => ({
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