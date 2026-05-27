import type { MeasurementDataPoint, DashboardSummary } from '@entities/dashboard';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from "@shared/model";

export const dashboardApi = {
  getMeasurementStats: async (): Promise<ApiResponseMessage<MeasurementDataPoint[]>> => {
    const res = await axiosPrivate.get('/dashboard/measurement-stats');
    return res.data;
  },

  getSummary: async (): Promise<ApiResponseMessage<DashboardSummary>> => {
    const res = await axiosPrivate.get('/dashboard/summary');
    return res.data;
  },
};
