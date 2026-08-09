import type { Tenant } from '@entities/tenant';
import { TENANT_STATUS_LABEL, SUBSCRIPTION_PLAN_LABEL } from '@shared/config';
import { formatBusinessNumber, formatDateTime } from '@shared/lib';

import type { TenantTableRow } from './types';

export const toTenantRows = (col: Tenant): TenantTableRow => ({
  tenantId: col.tenantId,
  name: col.name,
  bizNumber: formatBusinessNumber(col.bizNumber),
  status: TENANT_STATUS_LABEL[col.status] ?? col.status,
  subscriptionPlan: SUBSCRIPTION_PLAN_LABEL[col.subscriptionPlan] ?? col.subscriptionPlan,
  createdAt: formatDateTime(col.createdAt),
});
