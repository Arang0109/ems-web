import { useState, useCallback, useEffect } from "react";

import type { Workplace } from "./types";
import { workplaceApi } from "../api/api";

interface Props {
  workplaceId: number | null;
}

export const useWorkplaceDetail = ({ workplaceId }: Props) => {
  const [data, setData] = useState<Workplace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (workplaceId == null) return;
    let cancelled = false;
    workplaceApi.getWorkplace(workplaceId)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, workplaceId]);

  const clear = () => {
    setData(null)
  }

  return { data, loading, error, refetch, clear };
};
