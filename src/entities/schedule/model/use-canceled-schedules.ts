import { useState, useEffect, useCallback } from "react";

import { scheduleApi } from "../api/api";
import type { ScheduleListItem } from "./types";

/**
 * 취소된 측정계획 목록. 일반 목록에서 빠져 있으므로 전용 화면에서 조회한다.
 * 이 응답에서만 `canceledAt`·`cancelReason` 이 채워진다.
 */
export const useCanceledSchedules = () => {
  const [data, setData] = useState<ScheduleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    scheduleApi.getCanceledSchedules()
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);

  return { data, isLoading, error, refetch };
};
