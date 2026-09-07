import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { scheduleApi } from "../api/api";
import { scheduleKeys } from "./query-keys";
import type { ScheduleListItem } from "./types";

/** 측정계획 목록. 취소된 계획은 담기지 않는다. */
export const useSchedules = () =>
  useEntityQuery<ScheduleListItem[]>({
    queryKey: scheduleKeys.list(),
    queryFn: async () => unwrapMessage(await scheduleApi.getSchedules()),
    initialData: [],
  });
