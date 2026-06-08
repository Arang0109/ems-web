import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { StackRegisterRequest, StackListResponse } from './dto';
import type { Stack } from '../model/types';

export const stackApi = {
  getStacks: async (workplaceId: number | null = null): Promise<ApiResponseMessage<StackListResponse[]>> => {
    const params = workplaceId != null ? { workplaceId } : {};
    const res = await axiosPrivate.get('/stacks', { params });
    return res.data;
  },

  registerStack: async (data: StackRegisterRequest): Promise<ApiResponseMessage<Stack>> => {
    const res = await axiosPrivate.post('/stacks', data);
    return res.data;
  },

}