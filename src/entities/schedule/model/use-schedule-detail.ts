import { useState, useCallback } from "react";

import type { ScheduleDetail } from "./types";
import { toScheduleDetail } from "../api/mapper";
import { scheduleApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

// 타입 B(수동 호출): 부모(useParams)에서 fetchSchedule(id)를 명시 호출해야 로드된다.
export const useScheduleDetail = () => {
  const [data, setData] = useState<ScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 값을 함께 반환한다 — 저장 충돌 복구처럼 조회 결과를 곧바로 대조해야 하는 호출부가 있다.
  const fetchSchedule = useCallback(async (id: number): Promise<ScheduleDetail | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await scheduleApi.getSchedule(id);
      if (!res.status) {
        setError(res.message ?? ERROR_MESSAGE.FETCH);
        return null;
      }

      const detail = toScheduleDetail(res.data);
      setData(detail);
      return detail;
    } catch {
      setError(ERROR_MESSAGE.FETCH);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSchedule };
};
