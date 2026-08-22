import { useState } from "react";

import { scheduleApi } from "../api/api";

/** 잘못 입력된 실험분석정보를 지운다. 같은 측정항목으로 다시 등록할 수 있게 된다. */
export const useDeleteAnalysisAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAnalysis = async (scheduleId: number, analysisId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.deleteAnalysis(scheduleId, analysisId);
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteAnalysis, isLoading, error };
};
