import type { PollutantUpdate } from "@entities/pollutant";

import type { PollutantUpdateForm } from "./types";

import { trimValue } from "@shared/lib";

/**
 * Form → Domain.
 *
 * 고객사가 소유하는 값만 보내므로 폼 값을 그대로 옮긴다. 서버는 빈 문자열·null 을
 * "기존 값 유지"로 읽으므로, 비운 항목이 실수로 지워지지 않는다
 * (값을 지우는 방법은 없다 — 다른 값으로 덮어쓰기만 가능하다).
 */
export const toPollutantUpdate = (form: PollutantUpdateForm): PollutantUpdate => ({
  nameKr: trimValue(form.nameKr) || null,
  nameEn: trimValue(form.nameEn) || null,
  equipment: trimValue(form.equipment) || null,
  testMethod: trimValue(form.testMethod) || null,
});
