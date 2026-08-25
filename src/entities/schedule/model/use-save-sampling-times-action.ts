import { useState } from "react";

import type { AnalysisRecord, SamplingTimesSave } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisRecords, toSaveSamplingTimesRequest } from "../api/mapper";

/**
 * 성적서 항목별 채취시간을 일괄 저장한다.
 *
 * 기록이 없는 항목은 서버가 새로 만들고, 있으면 시각만 갈아끼운다. 실험실 입력값은 건드리지
 * 않으므로 실험·분석 탭과 동시에 열려 있어도 서로를 덮어쓰지 않는다.
 * 응답은 실제로 저장된 기록만 담는다 — 빈 행은 문서를 만들지 않고 건너뛰기 때문이다.
 */
export const useSaveSamplingTimesAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSamplingTimes = async (
    scheduleId: number, times: SamplingTimesSave,
  ): Promise<AnalysisRecord[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.saveSamplingTimes(
        scheduleId, toSaveSamplingTimesRequest(times),
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

  return { saveSamplingTimes, isLoading, error };
};
