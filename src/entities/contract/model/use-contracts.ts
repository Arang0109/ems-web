import { useState, useEffect, useCallback } from "react";

import type { ContractListItem } from "./types";
import { contractApi } from "../api/api";

export const useContracts = () => {
  const [data, setData] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
      setLoading(true);
      setRevision((r) => r + 1);
    }, []);

  useEffect(() => {
    let cancelled = false;
    contractApi.getContracts(null)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
    return () => { cancelled = true; };
  }, [revision]);

  return { data, loading, error, refetch };
};