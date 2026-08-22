import { useCallback, useState } from "react";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

/**
 * 삭제(감춤)된 측정계획을 되살린다(관리자 전용). 삭제 시점의 상태를 그대로 회복한다.
 * 삭제 후 같은 측정시설·팀·채취일자로 다시 등록한 계획이 있으면 자리가 겹쳐 서버가 409로 거부한다.
 */
export const useRestoreScheduleAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 표 컬럼 정의에 실려 들어가므로 렌더마다 새 함수가 되지 않도록 고정한다.
  const restoreSchedule = useCallback(async (id: number): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.restoreSchedule(id);
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
  }, []);

  return { restoreSchedule, isLoading, error };
};
