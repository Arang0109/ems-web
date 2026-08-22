import type { StackPollutantUpdate } from "@entities/stack-pollutant";
import { toNumberOrNull } from "@shared/lib";

import type { StackPollutantUpdateForm } from "./types";

/**
 * `hasStandardOxygen` 은 측정시설에 기준산소농도가 있는지다.
 * 없으면 적용 여부를 물을 수 없으므로 폼 값과 무관하게 false 로 보낸다 — 등록 경로와 같은 규칙이다.
 *
 * 허용기준은 빈 입력을 `0` 이 아니라 `null`("미지정")로 보낸다.
 */
export const toStackPollutantUpdate = (
  form: StackPollutantUpdateForm,
  hasStandardOxygen: boolean,
): StackPollutantUpdate => ({
  cycle: form.cycle,
  allowance: toNumberOrNull(form.allowance),
  oxygenApplicable: hasStandardOxygen && form.oxygenApplicable,
});
