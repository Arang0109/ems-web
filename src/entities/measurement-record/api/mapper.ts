import type { MeasurementRecordListResponse } from "./dto";
import type { MeasurementRecord } from "../model/types";

export const toMeasurementRecords = (
  dtos: MeasurementRecordListResponse[],
): MeasurementRecord[] => dtos;
