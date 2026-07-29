import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { TenantProvisionRequest, TenantResponse } from './dto';

export const tenantApi = {
  getTenant: async (id: number): Promise<ApiResponseMessage<TenantResponse>> => {
    const res = await axiosPrivate.get(`/platform/tenants/${id}`);
    return res.data;
  },

  getTenantList: async (): Promise<ApiResponseMessage<TenantResponse[]>> => {
    const res = await axiosPrivate.get('/platform/tenants');
    return res.data;
  },

  provisionTenant: async (data: TenantProvisionRequest): Promise<ApiResponseMessage<TenantResponse>> => {
    const res = await axiosPrivate.post('/platform/tenants', data);
    return res.data;
  },
};
