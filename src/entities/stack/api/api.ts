import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { StackRegisterRequest, StackTableListResponse } from './dto';
import type { Stack } from '../model/types';

export const stackApi = {
  getStacks: async (): Promise<ApiResponseMessage<Stack[]>> => {
    const res = await axiosPrivate.get('/stacks');
    return res.data;
  },

  getStacksByWorkplace: async (workplaceId: number): Promise<ApiResponseMessage<StackTableListResponse[]>> => {
    const res = await axiosPrivate.get(`/stacks?workplaceId=${workplaceId}`);
    return res.data;
  },

  registerStack: async (data: StackRegisterRequest): Promise<ApiResponseMessage<Stack>> => {
    const res = await axiosPrivate.post('/stacks', data);
    return res.data;
  },

}