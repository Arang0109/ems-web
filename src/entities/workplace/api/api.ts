import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  WorkplaceListResponse,
  WorkplaceResponse,
  ContractOverviewResponse,
  WorkplaceRegisterRequest,
  WorkplaceUpdateRequest,
} from './dto';

export const workplaceApi = {
  getWorkplace: async (workplaceId: number): Promise<ApiResponseMessage<WorkplaceResponse>> => {
    const res = await axiosPrivate.get(`/workplaces/${workplaceId}`);
    return res.data;
  },

  getWorkplaces: async (clientId: number | null = null): Promise<ApiResponseMessage<WorkplaceListResponse[]>> => {
    const params = clientId != null ? { clientId } : {};
    const res = await axiosPrivate.get('/workplaces', { params });
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverviewResponse>> => {
    const res = await axiosPrivate.get('/workplaces/contract-summary');
    return res.data;
  },

  registerWorkplace: async (data: WorkplaceRegisterRequest): Promise<ApiResponseMessage<WorkplaceResponse>> => {
    const res = await axiosPrivate.post('/workplaces', data);
    return res.data;
  },

  deleteWorkplace: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/workplaces/${id}`);
    return res.data;
  },

  updateWorkplace: async (id: number, data: WorkplaceUpdateRequest): Promise<ApiResponseMessage<WorkplaceResponse>> => {
    const res = await axiosPrivate.put(`/workplaces/${id}`, data);
    return res.data;
  },
}
