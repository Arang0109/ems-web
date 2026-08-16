import type { StackListItem } from '@entities/stack';
import { MEASUREMENT_FIELD_LABEL } from '@shared/config';
import { formatDate } from '@shared/lib';

import type { StackTableRow } from './types';

export const toStackRows = (row: StackListItem): StackTableRow => ({
  ...row,
  field: MEASUREMENT_FIELD_LABEL[row.field],
  createdAt: formatDate(row.createdAt),
  modifiedAt: formatDate(row.modifiedAt),
});
