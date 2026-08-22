import type { PollutantCatalogUpdate } from "@entities/pollutant-catalog";

import type { PollutantCatalogUpdateForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

export const toPollutantCatalogUpdate = (
  form: PollutantCatalogUpdateForm
): PollutantCatalogUpdate => ({
  field: form.field,
  nameKr: trimValue(form.nameKr),
  method: form.method || null,
  phase: form.phase || null,
  sortOrder: toNumberOrNull(form.sortOrder),
});
