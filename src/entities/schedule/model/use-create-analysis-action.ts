import { useState } from "react";

import type { AnalysisRecord, AnalysisRecordCreate } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisRecord, toCreateAnalysisRequest } from "../api/mapper";

/**
 * 측정항목 하나의 실험분석정보를 등록한다.
 * 허용기준치·산소보정 적용 여부는 서버가 측정 시점 스냅샷에서 복사해 채운다.
 */
export const useCreateAnalysisAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnalysis = async (
    scheduleId: number, analysis: AnalysisRecordCreate,
  ): Promise<AnalysisRecord> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.createAnalysis(scheduleId, toCreateAnalysisRequest(analysis));
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toAnalysisRecord(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createAnalysis, isLoading, error };
};
