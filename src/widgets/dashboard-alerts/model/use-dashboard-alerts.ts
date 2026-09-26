import { useMemo } from "react";

import { useDashboardOverview } from "@entities/dashboard";

import { toExpiringContracts, toInspectionDues } from "./mapper";

/** 요약 응답은 `DashboardStats` 와 같은 쿼리 키를 구독하므로 요청은 한 번만 나간다. */
export const useDashboardAlerts = () => {
  const { data, isLoading, error } = useDashboardOverview();

  const contracts = useMemo(() => (data ? toExpiringContracts(data) : []), [data]);
  const equipments = useMemo(() => (data ? toInspectionDues(data) : []), [data]);

  return { contracts, equipments, isLoading, error };
};
