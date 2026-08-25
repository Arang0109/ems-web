import { useState } from "react";

import type { AnalysisRecord, AnalysisResultsSave } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisRecords, toSaveAnalysisResultsRequest } from "../api/mapper";

/**
 * 항목별 실험분석 결과를 일괄 저장한다.
 *
 * 측정물질을 키로 upsert 하므로 호출자가 문서 id로 신규·기존을 가릴 필요가 없다 — 성적서 탭이
 * 채취시간을 먼저 저장해 문서를 만들어 둔 뒤에도 409 없이 저장된다.
 * 채취시간은 건드리지 않아 두 탭이 서로를 덮어쓰지 않는다.
 */
export const useSaveAnalysisResultsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAnalysisResults = async (
    scheduleId: number, results: AnalysisResultsSave,
  ): Promise<AnalysisRecord[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.saveAnalysisResults(
        scheduleId, toSaveAnalysisResultsRequest(results),
      );
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toAnalysisRecords(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveAnalysisResults, isLoading, error };
};
