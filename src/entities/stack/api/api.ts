import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  StackRegisterRequest, StackUpdateRequest, StackListResponse, StackDetailResponse, StackResponse
} from './dto';

export const stackApi = {
  getStack: async (stackId: number): Promise<ApiResponseMessage<StackDetailResponse>> => {
    const res = await axiosPrivate.get(`/stacks/${stackId}`);
    return res.data;
  },

  getStacks: async (workplaceId: number | null = null): Promise<ApiResponseMessage<StackListResponse[]>> => {
    const params = workplaceId != null ? { workplaceId } : {};
    const res = await axiosPrivate.get('/stacks', { params });
    return res.data;
  },

  registerStack: async (data: StackRegisterRequest): Promise<ApiResponseMessage<StackResponse>> => {
    const res = await axiosPrivate.post('/stacks', data);
    return res.data;
  },

  updateStack: async (id: number, data: StackUpdateRequest): Promise<ApiResponseMessage<StackResponse>> => {
    const res = await axiosPrivate.put(`/stacks/${id}`, data);
    return res.data;
  },
}