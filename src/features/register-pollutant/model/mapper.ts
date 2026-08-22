import type { PollutantCreate } from "@entities/pollutant";

import type { PollutantRegisterForm } from "./types";

import { trimValue } from "@shared/lib";

/**
 * Form → Domain.
 *
 * 빈 입력은 null 로 보낸다 — `nameKr` 의 null 은 "가이드 국문명을 복사한다"는 뜻이고,
 * 나머지는 "아직 입력하지 않았다"는 뜻이라 양쪽 모두 빈 문자열을 저장하는 것보다 낫다.
 *
 * `catalogId` 가 비어 있으면 호출부가 validator 로 이미 막았으므로 여기서는 숫자 변환만 한다.
 */
export const toPollutantCreate = (
  form: PollutantRegisterForm
): PollutantCreate => ({
  catalogId: Number(form.catalogId),
  nameKr: trimValue(form.nameKr) || null,
  nameEn: trimValue(form.nameEn) || null,
  equipment: trimValue(form.equipment) || null,
  testMethod: trimValue(form.testMethod) || null,
})
