import type { ScheduleItemUpdate } from "@entities/schedule";
import type { StackPollutantUpdate } from "@entities/stack-pollutant";
import { toNumberOrNull } from "@shared/lib";

import type { ScheduleItemUpdateForm } from "./types";

/**
 * Form(string) → Domain(number). 허용기준은 서버가 nullable(BigDecimal)이므로
 * toNumber(빈값→0)가 아니라 toNumberOrNull 을 쓴다 — 0으로 보내면 "기준 0"이 되어
 * 모든 측정값이 초과로 판정된다.
 */
export const toScheduleItemUpdate = (form: ScheduleItemUpdateForm): ScheduleItemUpdate => ({
  cycle: form.cycle,
  allowance: toNumberOrNull(form.allowance),
  oxygenApplicable: form.oxygenApplicable,
});

/** 같은 폼에서 원장 수정 요청도 만든다 — 두 저장소는 분리돼 있어도 사용자에겐 한 번의 수정이다. */
export const toStackPollutantUpdate = (form: ScheduleItemUpdateForm): StackPollutantUpdate => ({
  cycle: form.cycle,
  allowance: toNumberOrNull(form.allowance),
  oxygenApplicable: form.oxygenApplicable,
});
