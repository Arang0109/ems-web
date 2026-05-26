import type { MeasurementStats, DashboardSummary } from '@entities/dashboard';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from "@shared/model";

export const dashboardApi = {
  getMeasurementStats: async (): Promise<ApiResponseMessage<MeasurementStats>> => {
    const res = await axiosPrivate.get('/dashboard/measurement-stats');
    return res.data;
  },

  getSummary: async (): Promise<ApiResponseMessage<DashboardSummary>> => {
    const res = await axiosPrivate.get('/dashboard/summary');
    return res.data;
  },
};
