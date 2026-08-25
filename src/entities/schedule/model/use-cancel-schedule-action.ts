import { useState } from "react";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

/**
 * 업무가 무산된 측정계획을 취소한다. 취소 후 최신 상세(도메인)를 반환한다.
 * 삭제와 달리 계획은 목록에 남는다. 완료·취소된 계획의 재취소는 400으로 거부된다.
 */
export const useCancelScheduleAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSchedule = async (id: number): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.cancelSchedule(id);
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toScheduleDetail(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "서버 연결에 실패했습니다.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelSchedule, isLoading, error };
};
