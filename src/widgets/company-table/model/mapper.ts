import type { CompanyListResponse, CompanyUpdateRequest } from '@entities/company';
import { formatBusinessNumber } from '@shared/lib/formatters';

import type { CompanyTableRow, CompanyDetailFormData } from './types';

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

export const toCompanyUpdateRequest = (data: CompanyDetailFormData): CompanyUpdateRequest => ({
  name: data.name,
  representative: data.representative,
  address: data.address,
  bizNumber: data.bizNumber,
  manager: data.manager,
  email: data.email,
  tel: data.tel,
});