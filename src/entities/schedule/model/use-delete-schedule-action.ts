import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { scheduleApi } from "../api/api";

export const useDeleteScheduleAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await scheduleApi.deleteSchedule(id));
  });

  return { deleteSchedule: run, isLoading, error };
};
