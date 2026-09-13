import { unwrapMessage } from "@shared/api";

import { scheduleApi } from "../api/api";
import { toAnalysisResults, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 쿼리 정의(키 + 조회 함수) 한 벌.
 *
 * 선언형 훅(`useScheduleDetail`)과 명령형 조회(`useFetchScheduleDetail`)가 **같은 정의를 공유**해야
 * 같은 캐시를 본다. 정의가 갈리면 키가 어긋나 둘이 서로 다른 캐시를 채운다.
 */
export const scheduleDetailQuery = (id: number) => ({
  queryKey: scheduleKeys.detail(id),
  queryFn: async () => toScheduleDetail(unwrapMessage(await scheduleApi.getSchedule(id))),
});

export const scheduleAnalysesQuery = (scheduleId: number) => ({
  queryKey: scheduleKeys.analyses(scheduleId),
  queryFn: async () => toAnalysisResults(unwrapMessage(await scheduleApi.getAnalyses(scheduleId))),
});
