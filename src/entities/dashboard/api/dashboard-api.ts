import { axiosPrivate } from '@/shared/api';
import type { MeasurementStats, DashboardSummary } from '../model/dashboard-types';

export const dashboardApi = {
  getMeasurementStats: async (): Promise<MeasurementStats> => {
    const res = await axiosPrivate.get('/dashboard/measurement-stats');
    return res.data.data;
  },

  getSummary: async (): Promise<DashboardSummary> => {
    const res = await axiosPrivate.get('/dashboard/summary');
    return res.data.data;
  },
};
