import { useState, useCallback } from "react";

import type { AnalysisRecord } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisRecords } from "../api/mapper";

import { ERROR_MESSAGE } from "@shared/config";

/**
 * 타입 B(수동 호출): 측정계획 상세가 열린 뒤 fetchAnalyses(scheduleId)로 로드한다.
 * 저장 직후 목록을 그 자리에서 대조해야 하는 호출부가 있어 값도 함께 반환한다.
 */
export const useScheduleAnalyses = () => {
  const [data, setData] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async (scheduleId: number): Promise<AnalysisRecord[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await scheduleApi.getAnalyses(scheduleId);
      if (!res.status) {
        setError(res.message ?? ERROR_MESSAGE.FETCH);
        return [];
      }

      const records = toAnalysisRecords(res.data);
      setData(records);
      return records;
    } catch {
      setError(ERROR_MESSAGE.FETCH);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAnalyses };
};
