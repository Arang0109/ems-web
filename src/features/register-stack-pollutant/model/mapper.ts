import type { FormRow } from "./types";
import type { StackPollutantCreate } from "@entities/stack-pollutant";

import { toNumberOrNull } from "@shared/lib";

export const toStackPollutantCreates = (
  stackId: number,
  rows: FormRow[]
): StackPollutantCreate[] => rows.map((row) => ({
  stackId,
  pollutantId: Number(row.pollutantId),
  cycle: row.cycle,
  allowance: toNumberOrNull(row.allowance),
}));
