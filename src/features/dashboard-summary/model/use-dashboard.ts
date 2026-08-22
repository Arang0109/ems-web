import { useState, useEffect } from 'react';

import { dashboardApi } from '@entities/dashboard';

import type {
  MeasurementCountChart, OverallStats, MonthlyStats,
  ExpiringContract, InspectionDue,
} from './types';
import {
  toMeasurementCountChart, toOverallStats, toMonthlyStats,
  toExpiringContracts, toInspectionDues,
} from './mapper';

import { ERROR_MESSAGE } from "@shared/config";

export const useDashboard = () => {
  const [stats, setStats] = useState<MeasurementCountChart[] | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [inspectionDueEquipments, setInspectionDueEquipments] = useState<InspectionDue[]>([]);
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
        setExpiringContracts(toExpiringContracts(summaryData.data));
        setInspectionDueEquipments(toInspectionDues(summaryData.data));
      } catch {
        setError(ERROR_MESSAGE.FETCH);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return {
    stats, overallStats, monthlyStats,
    expiringContracts, inspectionDueEquipments,
    isLoading, error,
  };
};
