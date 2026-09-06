import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleCreate } from "./types";
import { scheduleApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterScheduleAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: ScheduleCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await scheduleApi.registerSchedule(payload));
  });

  return { registerSchedule: run, isLoading, error };
};
