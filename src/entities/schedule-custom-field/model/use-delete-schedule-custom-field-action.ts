import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { scheduleCustomFieldApi } from "../api/api";
import { scheduleCustomFieldKeys } from "./query-keys";

export const useDeleteScheduleCustomFieldAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await scheduleCustomFieldApi.deleteCustomField(id));
  }, { invalidateKeys: [scheduleCustomFieldKeys.all] });

  return { deleteScheduleCustomField: run, isLoading, error };
};
