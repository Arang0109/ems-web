import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleItemUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail, toUpdateItemRequest } from "../api/mapper";

export const useUpdateItemAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, pollutantId: number, item: ScheduleItemUpdate,): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.updateItem(id, pollutantId, toUpdateItemRequest(item)));
    return toScheduleDetail(result);
  });

  return { updateItem: run, isLoading, error };
};
