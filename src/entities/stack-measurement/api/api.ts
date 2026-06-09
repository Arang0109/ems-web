import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { StackMeasurementRegisterRequest, StackMeasurementResponse } from './dto';

export const stackMeasurementApi = {
  getStackMeasurements: async (
    stackId: number | null = null
  ): Promise<ApiResponseMessage<StackMeasurementResponse[]>> => {
    const params = stackId != null ? { stackId } : {};
    const res = await axiosPrivate.get('/stack-measurements', { params });
    return res.data;
  },

  registerStackMeasurement: async (
    data: StackMeasurementRegisterRequest
  ): Promise<ApiResponseMessage<StackMeasurementResponse>> => {
    const res = await axiosPrivate.post('/stack-measurements', data);
    return res.data;
  },
}