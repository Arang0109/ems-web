import { useState } from "react";

import type { ScheduleStatus } from "@shared/model";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

export const useChangeScheduleStatusAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상태 변경 후 최신 상세(도메인)를 반환한다. 허용되지 않는 전이는 서버가 400으로 거부한다.
  const changeScheduleStatus = async (
    id: number, status: ScheduleStatus,
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.changeStatus(id, { status });
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toScheduleDetail(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { changeScheduleStatus, isLoading, error };
};
