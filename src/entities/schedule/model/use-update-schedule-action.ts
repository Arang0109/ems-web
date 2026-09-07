import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleMetaUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateScheduleRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useUpdateScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, meta: ScheduleMetaUpdate): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.updateSchedule(id, toUpdateScheduleRequest(meta)));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { updateSchedule: run, isLoading, error };
};
