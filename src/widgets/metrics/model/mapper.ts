import type { MeasurementCount } from "@entities/dashboard";

import type { MeasurementChartPoint } from "./types";

export const toMeasurementChartPoint = (col: MeasurementCount): MeasurementChartPoint => ({
  label: col.label,
  count: col.count,
});
