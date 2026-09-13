import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { scheduleApi } from "../api/api";
import { scheduleKeys } from "./query-keys";
import type { ScheduleListItem } from "./types";

/** 취소된 측정계획 목록. 취소는 삭제와 달리 기록이 남는다. */
export const useCanceledSchedules = () =>
  useEntityQuery<ScheduleListItem[]>({
    queryKey: scheduleKeys.canceled(),
    queryFn: async () => unwrapMessage(await scheduleApi.getCanceledSchedules()),
    initialData: [],
  });
