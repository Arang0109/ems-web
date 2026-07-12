import type { FormRow } from "./types";
import type { StackMeasurementCreate } from "@entities/stack-measurement";

import { toNumberOrNull } from "@shared/lib";

export const toStackMeasurementCreates = (
  stackId: number,
  rows: FormRow[]
): StackMeasurementCreate[] => rows.map((row) => ({
  stackId,
  pollutantId: row.pollutantId,
  cycle: row.cycle,
  allowance: toNumberOrNull(row.allowance),
}));
