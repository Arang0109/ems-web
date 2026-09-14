import type { PollutantCatalogUpdate } from "@entities/pollutant-catalog";

import type { PollutantCatalogUpdateForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

export const toPollutantCatalogUpdate = (
  form: PollutantCatalogUpdateForm
): PollutantCatalogUpdate => ({
  field: form.field,
  nameKr: trimValue(form.nameKr),
  phase: form.phase || null,
  mode: form.mode || null,
  sortOrder: toNumberOrNull(form.sortOrder),
});
