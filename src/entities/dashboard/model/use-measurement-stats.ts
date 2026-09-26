import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { dashboardApi } from "../api/api";
import { dashboardKeys } from "./query-keys";
import type { MeasurementCount } from "./types";

/** 월별 측정 완료 건수 추이. */
export const useMeasurementStats = () =>
  useEntityQuery<MeasurementCount[]>({
    queryKey: dashboardKeys.measurementStats(),
    queryFn: async () => unwrapMessage(await dashboardApi.getMeasurementStats()),
    initialData: [],
  });
