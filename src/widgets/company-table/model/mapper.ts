import type { Company } from '@entities/company';
import { formatBusinessNumber } from '@shared/lib';
import { formatAddress } from '@shared/lib';

import type { CompanyTableRow } from './types';

export const toCompanyRows = (col: Company): CompanyTableRow => ({
  id: col.id,
  name: col.name,
  representative: col.representative,
  address: formatAddress(col.roadAddress, col.address),
  bizNumber: formatBusinessNumber(col.bizNumber),

  manager: col.manager,
  email: col.email,
  tel: col.tel,
});