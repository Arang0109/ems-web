import type { CompanyListResponse } from '@entities/company';
import { formatBusinessNumber } from '@shared/lib/formatters';

import type { CompanyTableRow } from './types';

export const toCompanyRows = (col: CompanyListResponse): CompanyTableRow => ({
  id: col.id,
  name: col.name,
  representative: col.representative,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),

  manager: col.manager,
  email: col.email,
  tel: col.tel,
});