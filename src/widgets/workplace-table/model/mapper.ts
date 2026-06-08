import type { WorkplaceListItem } from '@entities/workplace';
import { formatBusinessNumber } from '@shared/lib';

import type { WorkplaceTableRow } from './types';

export const toWorkplaceRows = (col: WorkplaceListItem): WorkplaceTableRow => ({
  id: col.id,
  companyId: col.companyId,
  companyName: col.companyName,
  workplaceName: col.workplaceName,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),
});