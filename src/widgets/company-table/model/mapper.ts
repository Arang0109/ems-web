import type { Company } from '@entities/company';
import { formatBusinessNumber } from '@shared/lib';

import type { CompanyTableRow } from './types';

export const toCompanyRows = (col: Company): CompanyTableRow => ({
  id: col.id,
  name: col.name,
  representative: col.representative,
  address: col.address,
  bizNumber: formatBusinessNumber(col.bizNumber),

  manager: col.manager,
  email: col.email,
  tel: col.tel,
});

export const toCompany = (data: CompanyTableRow): Company => ({
  id: data.id,
  name: data.name,
  representative: data.representative,
  address: data.address,
  bizNumber: data.bizNumber,

  manager: data.manager,
  email: data.email,
  tel: data.tel,
})