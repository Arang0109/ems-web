import type { Client } from '@entities/client';
import { formatBusinessNumber } from '@shared/lib';
import { formatAddress } from '@shared/lib';

import type { ClientTableRow } from './types';

export const toClientRows = (col: Client): ClientTableRow => ({
  id: col.id,
  name: col.name,
  representative: col.representative,
  address: formatAddress(col.roadAddress, col.address),
  bizNumber: formatBusinessNumber(col.bizNumber),

  manager: col.manager,
  email: col.email,
  tel: col.tel,
});