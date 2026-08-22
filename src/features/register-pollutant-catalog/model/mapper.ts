import type { PollutantCatalogCreate } from "@entities/pollutant-catalog";

import type { PollutantCatalogRegisterForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

/**
 * Form → Domain.
 *
 * `code` 는 대문자 규격이라 입력 흔들림(소문자·앞뒤 공백)을 여기서 흡수한다 —
 * 한번 등록하면 바꿀 수 없어 되돌릴 기회가 없다.
 */
export const toPollutantCatalogCreate = (
  form: PollutantCatalogRegisterForm
): PollutantCatalogCreate => ({
  code: trimValue(form.code).toUpperCase(),
  field: form.field,
  nameKr: trimValue(form.nameKr),
  method: form.method || null,
  phase: form.phase || null,
  sortOrder: toNumberOrNull(form.sortOrder),
});
