import type { Client } from '@entities/client';
import { formatAddress, formatBusinessNumber, formatPhoneNumber } from '@shared/lib';

import type { ClientTableRow } from './types';

export const toClientRows = (col: Client): ClientTableRow => ({
  id: col.id,
  name: col.name,
  representative: col.representative,
  address: formatAddress(col.roadAddress, col.detailAddress),
  bizNumber: formatBusinessNumber(col.bizNumber),

  manager: col.manager,
  email: col.email,
  tel: formatPhoneNumber(col.tel),
});