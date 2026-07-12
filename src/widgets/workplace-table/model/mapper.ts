import type { WorkplaceListItem } from '@entities/workplace';
import { formatBusinessNumber, formatAddress } from '@shared/lib';

import type { WorkplaceTableRow } from './types';

export const toWorkplaceRows = (col: WorkplaceListItem): WorkplaceTableRow => ({
  id: col.id,
  clientId: col.clientId,
  clientName: col.clientName,
  workplaceName: col.workplaceName,
  address: formatAddress(col.roadAddress, col.address),
  bizNumber: formatBusinessNumber(col.bizNumber),
});