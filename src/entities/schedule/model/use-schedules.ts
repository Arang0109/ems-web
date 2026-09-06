import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { scheduleApi } from "../api/api";
import type { ScheduleListItem } from "./types";

/** 타입 A(자동 로드): 측정계획 목록. 취소된 계획은 담기지 않는다. */
export const useSchedules = () =>
  useFetch<ScheduleListItem[]>(async () => unwrapMessage(await scheduleApi.getSchedules()), []);
