import type { ScheduleListItem } from "@entities/schedule";
import { MEASUREMENT_FIELD_LABEL } from "@shared/config";

import type { ScheduleTableRow } from "./types";

/**
 * `todayKey` 는 `toDateKey(new Date())` 형태의 `yyyy-MM-dd` 다.
 * 오늘을 함수 안에서 읽지 않고 인자로 받아 순수 함수로 남긴다 — 목록 전체가 같은 기준일을 쓴다.
 */
export const toScheduleRows = (item: ScheduleListItem, todayKey: string): ScheduleTableRow => ({
  id: String(item.id),
  measureDate: item.sampledAt ? item.sampledAt.slice(0, 10) : "-",
  isToday: item.sampledAt?.slice(0, 10) === todayKey,
  status: item.status,
  referenceNumber: item.referenceNumber ?? "-",
  measurementField: MEASUREMENT_FIELD_LABEL[item.measurementField],
  clientName: item.clientName ?? "-",
  stackName: item.stackName ?? "-",
  teamName: item.teamName ?? "-",
});
