import { useAsyncAction } from "@shared/model";
import type { BasicInfoUpdate, ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateBasicInfoRequest, toScheduleDetail } from "../api/mapper";

export const useUpdateBasicInfoAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, basicInfo: BasicInfoUpdate,): Promise<ScheduleDetail> => {
    const response = await scheduleApi.updateBasicInfo(id, toUpdateBasicInfoRequest(basicInfo));
    return toScheduleDetail(response);
  });

  return { updateBasicInfo: run, isLoading, error };
};
