import type { MeasurementMethod } from "@entities/measurement-method";

import type { MeasurementMethodTableRow } from "./types";

import { SAMPLE_GROUPING_LABEL } from "@shared/config";

/** 비어 있을 수 있는 칸의 표시 자리. 빈 칸으로 두면 열이 무너져 보인다. */
const EMPTY = "—";

export const toMeasurementMethodRow = (method: MeasurementMethod): MeasurementMethodTableRow => ({
  id: method.id,
  name: method.name,
  sampleGrouping: SAMPLE_GROUPING_LABEL[method.sampleGrouping],
  mergedSampleName: method.mergedSampleName || EMPTY,
  samplingMinutes: method.samplingMinutes != null ? `${method.samplingMinutes}분` : EMPTY,
  suctionFlowRate: method.suctionFlowRate != null ? `${method.suctionFlowRate} L/min` : EMPTY,
});
