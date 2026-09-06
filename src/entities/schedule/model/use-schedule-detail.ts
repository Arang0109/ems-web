import { unwrapMessage } from "@shared/api";
import { useLazyFetch } from "@shared/model";

import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";
import type { ScheduleDetail } from "./types";

/**
 * 타입 B(수동 호출): 부모(useParams)에서 fetchSchedule(id)를 명시 호출해야 로드된다.
 *
 * 트리거가 값을 함께 반환한다 — 저장 충돌 복구처럼 조회 결과를 다음 렌더가 아니라
 * 그 자리에서 대조해야 하는 호출부가 있다.
 */
export const useScheduleDetail = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (id: number) => toScheduleDetail(unwrapMessage(await scheduleApi.getSchedule(id))),
    null as ScheduleDetail | null,
    { initialLoading: true },
  );

  return { data, isLoading, error, fetchSchedule: fetch };
};
