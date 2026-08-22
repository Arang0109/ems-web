import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { StackPollutantRegisterRequest, StackPollutantTableResponse, StackPollutantResponse, StackPollutantBatchRegisterRequest, StackPollutantBatchResponse, StackPollutantUpdateRequest } from './dto';

export const stackPollutantApi = {
  getStackPollutants: async (
    stackId: number | null = null
  ): Promise<ApiResponseMessage<StackPollutantTableResponse[]>> => {
    const params = stackId != null ? { stackId } : {};
    const res = await axiosPrivate.get('stack-pollutants', { params });
    return res.data;
  },

  registerStackPollutant: async (
    data: StackPollutantRegisterRequest
  ): Promise<ApiResponseMessage<StackPollutantResponse>> => {
    const res = await axiosPrivate.post('stack-pollutants', data);
    return res.data;
  },

  registerStackPollutants: async (
    data: StackPollutantBatchRegisterRequest
  ): Promise<ApiResponseMessage<StackPollutantBatchResponse>> => {
    const res = await axiosPrivate.post('stack-pollutants/batch', data);
    return res.data;
  },

  updateStackPollutant: async (
    id: number, data: StackPollutantUpdateRequest
  ): Promise<ApiResponseMessage<StackPollutantResponse>> => {
    const res = await axiosPrivate.put(`stack-pollutants/${id}`, data);
    return res.data;
  },

  deleteStackPollutant: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`stack-pollutants/${id}`);
    return res.data;
  },
}