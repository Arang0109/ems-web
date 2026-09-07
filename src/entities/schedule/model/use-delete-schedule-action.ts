import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { scheduleApi } from "../api/api";
import { scheduleKeys } from "./query-keys";

export const useDeleteScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await scheduleApi.deleteSchedule(id));
  }, { invalidateKeys: [scheduleKeys.all] });

  return { deleteSchedule: run, isLoading, error };
};
