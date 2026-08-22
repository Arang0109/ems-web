import type { ScheduleListItem } from "@entities/schedule";

import type { DeletedScheduleTableRow } from "./types";

export const toDeletedScheduleRows = (item: ScheduleListItem): DeletedScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  status: item.status,
  referenceNumber: item.referenceNumber ?? "-",
  clientName: item.clientName ?? "-",
  workplaceName: item.workplaceName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
  deletedAt: item.deletedAt ? item.deletedAt.slice(0, 10) : "-",
});
