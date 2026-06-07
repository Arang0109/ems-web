import type { Company, CompanyUpdate } from '@entities/company';
import { formatBusinessNumber, trimValue, unformatNumber } from '@shared/lib';

import type { CompanyTableRow, CompanyDetailFormData } from './types';

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

export const toCompanyUpdateRequest = (data: CompanyDetailFormData): CompanyUpdate => ({
  name: trimValue(data.name),
  representative: trimValue(data.representative),
  address: trimValue(data.address),
  bizNumber: unformatNumber(data.bizNumber),
  manager: trimValue(data.manager),
  email: trimValue(data.email),
  tel: data.tel,
});