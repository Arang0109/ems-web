import { useState, useCallback } from "react";

import type { ScheduleDetail } from "./types";
import { toScheduleDetail } from "../api/mapper";
import { scheduleApi } from "../api/api";

// 타입 B(수동 호출): 부모(useParams)에서 fetchSchedule(id)를 명시 호출해야 로드된다.
export const useScheduleDetail = () => {
  const [data, setData] = useState<ScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await scheduleApi.getSchedule(id);
      if (!res.status) {
        setError(res.message ?? "데이터를 불러오지 못했습니다.");
        return;
      }
      setData(toScheduleDetail(res.data));
    } catch {
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSchedule };
};
