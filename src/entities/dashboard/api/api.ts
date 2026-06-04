import type { MeasurementCountChartResponse, DashboardOverviewResponse } from './dtos';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from "@shared/model";

export const dashboardApi = {
  getMeasurementStats: async (): Promise<ApiResponseMessage<MeasurementCountChartResponse[]>> => {
    const res = await axiosPrivate.get('/dashboard/measurement-stats');
    return res.data;
  },

  getSummary: async (): Promise<ApiResponseMessage<DashboardOverviewResponse>> => {
    const res = await axiosPrivate.get('/dashboard/summary');
    return res.data;
  },
};