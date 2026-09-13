import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useEntityQuery } from "@shared/model";

import { scheduleAnalysesQuery } from "./queries";
import type { AnalysisResult } from "./types";

/** 측정계획의 분석 결과 목록. `scheduleId` 가 null 이면 조회하지 않는다. */
export const useScheduleAnalyses = (scheduleId: number | null) =>
  useEntityQuery<AnalysisResult[]>({
    ...scheduleAnalysesQuery(scheduleId as number),
    initialData: [],
    enabled: scheduleId != null,
  });

/**
 * 분석 결과를 **그 자리에서** 받아오는 명령형 조회.
 *
 * 저장·삭제 직후 서버 값을 폼과 기준선에 동시에 앉혀야 하는 호출부가 있다.
 * 실패하면 `null` 이며 예외를 던지지 않는다(`useFetchScheduleDetail` 과 같은 계약).
 */
export const useFetchScheduleAnalyses = () => {
  const queryClient = useQueryClient();

  return useCallback(
    async (scheduleId: number): Promise<AnalysisResult[] | null> => {
      try {
        return await queryClient.fetchQuery(scheduleAnalysesQuery(scheduleId));
      } catch {
        return null;
      }
    },
    [queryClient],
  );
};
