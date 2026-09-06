import type { ScheduleListItem } from "@entities/schedule";

import type { CanceledScheduleTableRow } from "./types";

export const toCanceledScheduleRows = (item: ScheduleListItem): CanceledScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  referenceNumber: item.referenceNumber ?? "-",
  clientName: item.clientName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
});
