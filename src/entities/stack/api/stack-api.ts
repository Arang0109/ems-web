import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Stack, StackTableRow } from './stack-dtos';

export const stackApi = {
  getStacks: async (): Promise<ApiResponseMessage<Stack[]>> => {
    const res = await axiosPrivate.get('/stacks');
    return res.data;
  },

  getStacksByWorkplace: async (workplaceId: number): Promise<ApiResponseMessage<StackTableRow[]>> => {
    const res = await axiosPrivate.get(`/stacks?workplaceId=${workplaceId}`);
    return res.data;
  },
}