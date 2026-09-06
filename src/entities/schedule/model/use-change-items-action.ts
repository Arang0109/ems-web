import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleItemsUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeItemsRequest, toScheduleDetail } from "../api/mapper";

export const useChangeItemsAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, items: ScheduleItemsUpdate): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.changeItems(id, toChangeItemsRequest(items)));
    return toScheduleDetail(result);
  });

  return { changeItems: run, isLoading, error };
};
