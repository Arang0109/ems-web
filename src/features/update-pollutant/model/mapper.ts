import type { PollutantUpdate } from "@entities/pollutant";

import type { PollutantUpdateForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

/**
 * Form → Domain.
 *
 * 고객사가 소유하는 값만 보내므로 폼 값을 그대로 옮긴다. 서버는 빈 문자열·null 을
 * "기존 값 유지"로 읽으므로, 비운 항목이 실수로 지워지지 않는다
 * (값을 지우는 방법은 없다 — 다른 값으로 덮어쓰기만 가능하다).
 * 예외는 `samplingMinutes` 다 — 서버가 보낸 값을 그대로 저장하므로 비우면 실제로 오버라이드가 걷히고
 * 측정방법 표준값으로 되돌아간다.
 */
export const toPollutantUpdate = (form: PollutantUpdateForm): PollutantUpdate => ({
  methodId: form.methodId ? Number(form.methodId) : null,
  samplingMinutes: toNumberOrNull(form.samplingMinutes),
  suctionFlowRate: toNumberOrNull(form.suctionFlowRate),
  nameKr: trimValue(form.nameKr) || null,
  nameEn: trimValue(form.nameEn) || null,
  equipment: trimValue(form.equipment) || null,
  testMethod: trimValue(form.testMethod) || null,
});
