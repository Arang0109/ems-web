import type { PollutantUpdate } from "@entities/pollutant";

import type { PollutantUpdateForm } from "./types";

import { trimValue } from "@shared/lib";

export const toPollutantUpdate = (
  form: PollutantUpdateForm
): PollutantUpdate => ({
  field: form.field,
  nameKr: trimValue(form.nameKr),
  nameEn: trimValue(form.nameEn),
  method: form.method,
  phase: form.phase,
  equipment: trimValue(form.equipment),
  testMethod: trimValue(form.testMethod),
});
