import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { dashboardApi } from "../api/api";
import { dashboardKeys } from "./query-keys";
import type { DashboardOverview } from "./types";

/** 대시보드 요약(통계·만료 임박 목록). */
export const useDashboardOverview = () =>
  useEntityQuery<DashboardOverview | null>({
    queryKey: dashboardKeys.overview(),
    queryFn: async () => unwrapMessage(await dashboardApi.getSummary()),
    initialData: null,
  });
