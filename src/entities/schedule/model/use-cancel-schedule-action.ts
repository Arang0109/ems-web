import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 업무가 무산된 측정계획을 취소한다. 취소 후 최신 상세(도메인)를 반환한다.
 * 삭제와 달리 계획은 목록에 남는다. 완료·취소된 계획의 재취소는 400으로 거부된다.
 */
export const useCancelScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.cancelSchedule(id));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { cancelSchedule: run, isLoading, error };
};
