import type { StackTableListResponse } from '@entities/stack';
import { MEASUREMENT_FIELD_LABEL } from '@shared/model';

import type { StackTableRow } from './types';

export const toStackRows = (row: StackTableListResponse): StackTableRow => ({
  ...row,
  field: MEASUREMENT_FIELD_LABEL[row.field],
});
