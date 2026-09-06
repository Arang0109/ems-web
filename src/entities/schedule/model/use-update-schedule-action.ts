import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleMetaUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateScheduleRequest, toScheduleDetail } from "../api/mapper";

export const useUpdateScheduleAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, meta: ScheduleMetaUpdate): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.updateSchedule(id, toUpdateScheduleRequest(meta)));
    return toScheduleDetail(result);
  });

  return { updateSchedule: run, isLoading, error };
};
