import { useMemo } from 'react';

import { useMeasurementStats, useDashboardOverview } from '@entities/dashboard';

import {
  toMeasurementCountChart, toOverallStats, toMonthlyStats,
  toExpiringContracts, toInspectionDues,
} from './mapper';

export const useDashboard = () => {
  const statsQuery = useMeasurementStats();
  const overviewQuery = useDashboardOverview();

  const stats = useMemo(() => statsQuery.data.map(toMeasurementCountChart), [statsQuery.data]);

  const overview = overviewQuery.data;
  const summary = useMemo(() => overview && ({
    overallStats: toOverallStats(overview),
    monthlyStats: toMonthlyStats(overview),
    expiringContracts: toExpiringContracts(overview),
    inspectionDueEquipments: toInspectionDues(overview),
  }), [overview]);

  return {
    stats,
    overallStats: summary?.overallStats ?? null,
    monthlyStats: summary?.monthlyStats ?? null,
    expiringContracts: summary?.expiringContracts ?? [],
    inspectionDueEquipments: summary?.inspectionDueEquipments ?? [],
    isLoading: statsQuery.isLoading || overviewQuery.isLoading,
    error: statsQuery.error ?? overviewQuery.error,
  };
};
