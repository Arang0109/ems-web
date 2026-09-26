import { useMemo } from "react";

import { useMeasurementStats } from "@entities/dashboard";

import { toMeasurementChartPoint } from "./mapper";

export const useMeasurementChart = () => {
  const { data, isLoading, error } = useMeasurementStats();

  const points = useMemo(() => data.map(toMeasurementChartPoint), [data]);

  return { points, isLoading, error };
};
