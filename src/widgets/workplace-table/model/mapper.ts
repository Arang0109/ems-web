import type { WorkplaceListResponse, WorkplaceUpdateRequest } from '@entities/workplace';
import { formatBusinessNumber, stripFormatting } from '@shared/lib/formatters';

import type { WorkplaceDetailFormData, WorkplaceTableRow } from './types';

export const toWorkplaceRows = (col: WorkplaceListResponse): WorkplaceTableRow => ({
  id: col.id,
  companyId: col.companyId,
  companyName: col.companyName,
  workplaceName: col.workplaceName,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),
});

export const toWorkplaceUpdateRequest = (col: WorkplaceDetailFormData): WorkplaceUpdateRequest => ({
  name: col.name,
  address: col.address,
  bizNumber: stripFormatting(col.bizNumber),
});