import { useState } from "react";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

/**
 * 완료·취소된 측정계획을 되돌려 다시 편집할 수 있게 한다. 재개방 후 최신 상세(도메인)를 반환한다.
 * 재개방하면 상태가 완료가 아니게 되므로 측정 건수 통계에서도 자동으로 빠진다.
 */
export const useReopenScheduleAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reopenSchedule = async (id: number): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.reopenSchedule(id);
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

  return { reopenSchedule, isLoading, error };
};
