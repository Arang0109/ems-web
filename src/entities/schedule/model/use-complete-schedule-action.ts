import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 분석을 마친 측정계획을 완료로 확정한다. 확정 후 최신 상세(도메인)를 반환한다.
 * 분석중이 아닌 상태에서의 확정은 서버가 400으로 거부한다.
 */
export const useCompleteScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.completeSchedule(id));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { completeSchedule: run, isLoading, error };
};
