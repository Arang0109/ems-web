import type { WorkplaceListItem, WorkplaceUpdate } from '@entities/workplace';
import { formatBusinessNumber, unformatNumber } from '@shared/lib';

import type { WorkplaceDetailFormData, WorkplaceTableRow } from './types';

export const toWorkplaceRows = (col: WorkplaceListItem): WorkplaceTableRow => ({
  id: col.id,
  companyId: col.companyId,
  companyName: col.companyName,
  workplaceName: col.workplaceName,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),
});

export const toWorkplaceUpdateRequest = (col: WorkplaceDetailFormData): WorkplaceUpdate => ({
  name: col.name,
  address: col.address,
  bizNumber: unformatNumber(col.bizNumber),
});