import type { FormRow } from "./types";
import type { StackPollutantCreate } from "@entities/stack-pollutant";

import { toNumberOrNull } from "@shared/lib";

/**
 * `hasStandardOxygen` 은 측정시설에 기준산소농도가 있는지다.
 * 없으면 적용 여부를 물을 수 없으므로 폼 값과 무관하게 false 로 보낸다.
 */
export const toStackPollutantCreates = (
  stackId: number,
  rows: FormRow[],
  hasStandardOxygen: boolean,
): StackPollutantCreate[] => rows.map((row) => ({
  stackId,
  pollutantId: Number(row.pollutantId),
  cycle: row.cycle,
  allowance: toNumberOrNull(row.allowance),
  oxygenApplicable: hasStandardOxygen && row.oxygenApplicable,
}));
