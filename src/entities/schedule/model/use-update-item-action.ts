import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleItemUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail, toUpdateItemRequest } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useUpdateItemAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, pollutantId: number, item: ScheduleItemUpdate,): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.updateItem(id, pollutantId, toUpdateItemRequest(item)));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { updateItem: run, isLoading, error };
};
