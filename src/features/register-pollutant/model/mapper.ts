import type { PollutantCreate } from "@entities/pollutant";

import type { PollutantRegisterForm } from "./types";

import { trimValue } from "@shared/lib";

export const toPollutantCreate = (
  form: PollutantRegisterForm
): PollutantCreate => ({
  field: form.field,
  nameKr: trimValue(form.nameKr),
  nameEn: trimValue(form.nameEn),
  method: form.method,
  phase: form.phase,
  equipment: trimValue(form.equipment),
  testMethod: trimValue(form.testMethod),
})