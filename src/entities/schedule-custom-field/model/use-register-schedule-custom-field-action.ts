import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { scheduleCustomFieldApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import type { ScheduleCustomFieldCreate } from "./types";
import { scheduleCustomFieldKeys } from "./query-keys";

export const useRegisterScheduleCustomFieldAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: ScheduleCustomFieldCreate) => {
    unwrapMessage(await scheduleCustomFieldApi.registerCustomField(toRegisterRequest(data)));
  }, { invalidateKeys: [scheduleCustomFieldKeys.all] });

  return { registerScheduleCustomField: run, isLoading, error };
};
