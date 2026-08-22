import type { ScheduleListItem } from "@entities/schedule";

import type { CanceledScheduleTableRow } from "./types";

export const toCanceledScheduleRows = (item: ScheduleListItem): CanceledScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  referenceNumber: item.referenceNumber ?? "-",
  clientName: item.clientName ?? "-",
  workplaceName: item.workplaceName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
  canceledDate: item.canceledAt ? item.canceledAt.slice(0, 10) : "-",
  // 이력 백필 등으로 취소 이력이 없는 계획이 섞일 수 있다.
  cancelReason: item.cancelReason ?? "-",
});
