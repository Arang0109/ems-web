import type { ScheduleListItem } from "@entities/schedule";
import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_TYPE_LABEL } from "@shared/config";
import type { MeasurementType } from "@shared/model";

import type { ScheduleTableRow } from "./types";

const toMeasurementTypeLabel = (value: string | null): string => {
  if (!value) return "-";
  return MEASUREMENT_TYPE_LABEL[value as MeasurementType] ?? value;
};

export const toScheduleRows = (item: ScheduleListItem): ScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  status: item.status,
  referenceNumber: item.referenceNumber ?? "-",
  measurementField: MEASUREMENT_FIELD_LABEL[item.measurementField],
  measurementType: toMeasurementTypeLabel(item.schedulePurpose),
  clientName: item.clientName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
});
