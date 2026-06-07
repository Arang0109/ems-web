import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Workplace, ContractOverview } from '../model/types';
import type { WorkplaceListResponse, WorkplaceRegisterRequest, WorkplaceUpdateRequest } from './dto';

export const workplaceApi = {
  getWorkplaces: async (companyId: number | null = null): Promise<ApiResponseMessage<WorkplaceListResponse[]>> => {
    const params = companyId != null ? { companyId } : {};

    const res = await axiosPrivate.get('/workplaces', { params });
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverview>> => {
    const res = await axiosPrivate.get('/workplaces/contract-summary');
    return res.data;
  },

  registerWorkplace: async (data: WorkplaceRegisterRequest): Promise<ApiResponseMessage<Workplace>> => {
    const res = await axiosPrivate.post('/workplaces', data);
    return res.data;
  },

  deleteWorkplace: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/workplaces/${id}`);
    return res.data;
  },

  updateWorkplace: async (id: number, data: WorkplaceUpdateRequest): Promise<ApiResponseMessage<Workplace>> => {
    const res = await axiosPrivate.put(`/workplaces/${id}`, data);
    return res.data;
  },
}
