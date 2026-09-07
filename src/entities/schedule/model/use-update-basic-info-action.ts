import { useEntityMutation } from "@shared/model";
import type { BasicInfoUpdate, ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateBasicInfoRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useUpdateBasicInfoAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, basicInfo: BasicInfoUpdate,): Promise<ScheduleDetail> => {
    const response = await scheduleApi.updateBasicInfo(id, toUpdateBasicInfoRequest(basicInfo));
    return toScheduleDetail(response);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { updateBasicInfo: run, isLoading, error };
};
