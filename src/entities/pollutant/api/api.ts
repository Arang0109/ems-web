import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { PollutantRegisterRequest, PollutantResponse, PollutantUpdateRequest } from './dto';

export const pollutantApi = {
  getPollutants: async (): Promise<ApiResponseMessage<PollutantResponse[]>> => {
      const res = await axiosPrivate.get('/pollutants');
      return res.data;
    },

  registerPollutant: async (data: PollutantRegisterRequest): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.post('/pollutants', data);
    return res.data;
  },

  updatePollutant: async (id: number, data: PollutantUpdateRequest): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.put(`/pollutants/${id}`, data);
    return res.data;
  },

  deletePollutant: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/pollutants/${id}`);
    return res.data;
  },
}