import { useState, useEffect } from 'react';

import { dashboardApi } from '@entities/dashboard';

import type { MeasurementCountChart, OverallStats, MonthlyStats } from './types';
import { toMeasurementCountChart, toOverallStats, toMonthlyStats } from './mapper';

export const useDashboard = () => {
  const [stats, setStats] = useState<MeasurementCountChart[] | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [statsData, summaryData] = await Promise.all([
          dashboardApi.getMeasurementStats(),
          dashboardApi.getSummary(),
        ]);
        setStats(statsData.data.map((d) => toMeasurementCountChart(d)));
        setOverallStats(toOverallStats(summaryData.data));
        setMonthlyStats(toMonthlyStats(summaryData.data));
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { stats, overallStats, monthlyStats, isLoading, error };
};
