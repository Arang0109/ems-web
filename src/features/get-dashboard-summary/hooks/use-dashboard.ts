import { useState, useEffect } from 'react';
import { dashboardApi } from '@entities/dashboard';
import type { MeasurementDataPoint, DashboardSummary } from '@entities/dashboard';

export const useDashboard = () => {
  const [stats, setStats] = useState<MeasurementDataPoint[] | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
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
        setStats(statsData.data);
        setSummary(summaryData.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { stats, summary, isLoading, error };
};
