import type { StackTableListResponse } from '@entities/stack';
import { MEASUREMENT_FIELD_LABEL } from '@shared/model';
import { toDateString } from '@shared/lib/formatters';

import type { StackTableRow } from './types';

export const toStackRows = (row: StackTableListResponse): StackTableRow => ({
  ...row,
  field: MEASUREMENT_FIELD_LABEL[row.field],
  createdAt: toDateString(row.createdAt),
  modifiedAt: toDateString(row.modifiedAt),
});
