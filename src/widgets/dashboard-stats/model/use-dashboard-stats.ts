import { useMemo } from "react";

import { useDashboardOverview } from "@entities/dashboard";

import { toMonthlyStats, toOverallStats } from "./mapper";

export const useDashboardStats = () => {
  const { data, isLoading, error } = useDashboardOverview();

  const stats = useMemo(
    () => data && { overallStats: toOverallStats(data), monthlyStats: toMonthlyStats(data) },
    [data],
  );

  return { stats, isLoading, error };
};
