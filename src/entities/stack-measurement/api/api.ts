import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { StackMeasurementRegisterRequest, StackMeasurementTableResponse, StackMeasurementResponse, StackMeasurementBatchRegisterRequest, StackMeasurementBatchResponse } from './dto';

export const stackMeasurementApi = {
  getStackMeasurements: async (
    stackId: number | null = null
  ): Promise<ApiResponseMessage<StackMeasurementTableResponse[]>> => {
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

  registerStackMeasurements: async (
    data: StackMeasurementBatchRegisterRequest
  ): Promise<ApiResponseMessage<StackMeasurementBatchResponse>> => {
    const res = await axiosPrivate.post('/stack-measurements/batch', data);
    return res.data;
  },
}