import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleCreate } from "./types";
import { scheduleApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useRegisterScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: ScheduleCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await scheduleApi.registerSchedule(payload));
  }, { invalidateKeys: [scheduleKeys.all] });

  return { registerSchedule: run, isLoading, error };
};
