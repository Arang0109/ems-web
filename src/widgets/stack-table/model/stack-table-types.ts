import { MEASUREMENT_FIELD_LABEL } from "@shared/model";
import type { StackTableRow } from "@entities/stack";

export type StackTableCols = {
  id: number;
  companyName: string;
  workplaceName: string;
  field: string;
  stackName: string;
  createdAt: string;
  modifiedAt: string;
};

export const toStackTableCols = (row: StackTableRow): StackTableCols => ({
  ...row,
  field: MEASUREMENT_FIELD_LABEL[row.field],
});
