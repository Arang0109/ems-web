import { useState, useEffect, useCallback } from "react";

import type { WorkplaceListItem } from "./types";
import { workplaceApi } from "../api/api";

export const useWorkplaces = () => {
  const [data, setData] = useState<WorkplaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    workplaceApi.getWorkplaces(null)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);

  const workplaceOptions = data.map(wp => ({
    value: String(wp.id),
    label: `${wp.workplaceName}`,
  }));

  return {
    data,
    loading,
    error,
    workplaceOptions,
    refetch,
  }
}
