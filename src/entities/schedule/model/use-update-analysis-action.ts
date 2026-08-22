import { useState } from "react";

import type { AnalysisRecord, AnalysisRecordUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisRecord, toUpdateAnalysisRequest } from "../api/mapper";

/** 실험분석정보의 실험실 입력값을 수정한다. 전달하지 않은 필드는 서버가 기존 값을 유지한다. */
export const useUpdateAnalysisAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnalysis = async (
    scheduleId: number, analysisId: string, analysis: AnalysisRecordUpdate,
  ): Promise<AnalysisRecord> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.updateAnalysis(
        scheduleId, analysisId, toUpdateAnalysisRequest(analysis),
      );
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

  return { updateAnalysis, isLoading, error };
};
