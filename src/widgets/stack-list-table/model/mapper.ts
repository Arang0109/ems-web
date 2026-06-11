import type { StackListItem } from '@entities/stack';
import { MEASUREMENT_FIELD_LABEL } from '@shared/config';
import { formatDateTime } from '@shared/lib';

import type { StackTableRow } from './types';

export const toStackRows = (row: StackListItem): StackTableRow => ({
  ...row,
  field: MEASUREMENT_FIELD_LABEL[row.field],
  createdAt: formatDateTime(row.createdAt),
  modifiedAt: formatDateTime(row.modifiedAt),
});
