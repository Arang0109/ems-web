import type { WorkplaceTableListResponse, WorkplaceUpdateRequest } from '@entities/workplace';
import { formatBusinessNumber } from '@shared/lib/formatters';

import type { WorkplaceDetailFormData, WorkplaceTableRow } from './types';

export const toWorkplaceRows = (col: WorkplaceTableListResponse): WorkplaceTableRow => ({
  id: col.id,
  companyId: col.companyId,
  companyName: col.companyName,
  workplaceName: col.workplaceName,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),
});

export const toWorkplaceUpdateRequest = (col: WorkplaceDetailFormData): WorkplaceUpdateRequest => ({
  name: col.workplaceName,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),
});