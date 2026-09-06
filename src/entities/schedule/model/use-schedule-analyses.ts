import { unwrapMessage } from "@shared/api";
import { useLazyFetch } from "@shared/model";

import { scheduleApi } from "../api/api";
import { toAnalysisResults } from "../api/mapper";
import type { AnalysisResult } from "./types";

/**
 * 타입 B(수동 호출): 측정계획 상세가 열린 뒤 fetchAnalyses(scheduleId)로 로드한다.
 * 저장 직후 목록을 그 자리에서 대조해야 하는 호출부가 있어 값도 함께 반환한다.
 */
export const useScheduleAnalyses = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (scheduleId: number) => toAnalysisResults(unwrapMessage(await scheduleApi.getAnalyses(scheduleId))),
    [] as AnalysisResult[],
  );

  return { data, isLoading, error, fetchAnalyses: fetch };
};
