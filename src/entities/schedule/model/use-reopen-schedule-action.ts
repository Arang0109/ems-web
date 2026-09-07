import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 완료·취소된 측정계획을 되돌려 다시 편집할 수 있게 한다. 재개방 후 최신 상세(도메인)를 반환한다.
 * 재개방하면 상태가 완료가 아니게 되므로 측정 건수 통계에서도 자동으로 빠진다.
 */
export const useReopenScheduleAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.reopenSchedule(id));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { reopenSchedule: run, isLoading, error };
};
