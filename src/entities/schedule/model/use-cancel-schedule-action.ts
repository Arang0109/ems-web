import { useState } from "react";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

/**
 * 업무가 무산된 측정계획을 취소한다. 취소 후 최신 상세(도메인)를 반환한다.
 * 삭제와 달리 계획은 목록에 남고 사유가 상태 변경 이력에 기록된다.
 * 사유는 서버에서 필수이며, 완료·취소된 계획의 재취소는 400으로 거부된다.
 */
export const useCancelScheduleAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSchedule = async (id: number, reason: string): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.cancelSchedule(id, { reason });
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
