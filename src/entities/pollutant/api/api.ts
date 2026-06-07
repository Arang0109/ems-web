import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { PollutantRegisterRequest, PollutantResponse } from './dtos';

export const pollutantApi = {
  getPollutants: async (): Promise<ApiResponseMessage<PollutantResponse[]>> => {
      const res = await axiosPrivate.get('/pollutants');
      return res.data;
    },

  registerPollutant: async (data: PollutantRegisterRequest): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.post('/pollutants', data);
    return res.data;
  },
}