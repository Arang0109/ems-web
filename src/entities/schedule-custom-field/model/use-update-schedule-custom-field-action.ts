import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { scheduleCustomFieldApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import type { ScheduleCustomFieldUpdate } from "./types";
import { scheduleCustomFieldKeys } from "./query-keys";

export const useUpdateScheduleCustomFieldAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: ScheduleCustomFieldUpdate) => {
    unwrapMessage(await scheduleCustomFieldApi.updateCustomField(id, toUpdateRequest(data)));
  }, { invalidateKeys: [scheduleCustomFieldKeys.all] });

  return { updateScheduleCustomField: run, isLoading, error };
};
