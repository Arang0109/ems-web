import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { scheduleApi } from "../api/api";
import type { ScheduleListItem } from "./types";

/** 타입 A(자동 로드): 취소된 측정계획 목록. 취소는 삭제와 달리 기록이 남는다. */
export const useCanceledSchedules = () =>
  useFetch<ScheduleListItem[]>(async () => unwrapMessage(await scheduleApi.getCanceledSchedules()), []);
