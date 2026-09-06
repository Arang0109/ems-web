import type { ScheduleListItem } from "@entities/schedule";
import { MEASUREMENT_FIELD_LABEL } from "@shared/config";

import type { ScheduleTableRow } from "./types";

export const toScheduleRows = (item: ScheduleListItem): ScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  status: item.status,
  referenceNumber: item.referenceNumber ?? "-",
  measurementField: MEASUREMENT_FIELD_LABEL[item.measurementField],
  clientName: item.clientName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
});
