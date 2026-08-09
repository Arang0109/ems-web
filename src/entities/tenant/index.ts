export { tenantApi } from './api/api';

export type {
  Tenant,
  TenantProvision,
  TenantAdminCreate,
} from './model/types';

export { useTenants } from './model/use-tenants';
export { useProvisionTenantAction } from './model/use-provision-tenant-action';
