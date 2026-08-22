import type { FormRow } from "./types";
import type { StackPollutantCreate } from "@entities/stack-pollutant";

import { toNumberOrNull } from "@shared/lib";

/**
 * `hasStandardOxygen` 은 측정시설에 기준산소농도가 있는지다.
 * 없으면 적용 여부를 물을 수 없으므로 폼 값과 무관하게 false 로 보낸다.
 *
 * 물질을 고르지 않은 행은 지목할 대상이 없어 **빠뜨린다** — 서버가 400 으로 전체를 롤백시키는 대신
 * 채운 행만 등록한다. 한 행도 남지 않는 경우는 호출부(`use-register-stack-pollutant`)가 막는다.
 */
export const toStackPollutantCreates = (
  stackId: number,
  rows: FormRow[],
  hasStandardOxygen: boolean,
): StackPollutantCreate[] => rows.flatMap((row) => {
  if (!row.pollutantId) return [];

  return [{
    stackId,
    pollutantId: Number(row.pollutantId),
    cycle: row.cycle,
    allowance: toNumberOrNull(row.allowance),
    oxygenApplicable: hasStandardOxygen && row.oxygenApplicable,
  }];
});
