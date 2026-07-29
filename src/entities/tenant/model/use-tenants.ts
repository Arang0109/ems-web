import { useState, useEffect, useCallback } from "react";

import { tenantApi } from "../api/api";
import { toTenant } from "../api/mapper";
import type { Tenant } from "./types";

export const useTenants = () => {
  const [data, setData] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    tenantApi.getTenantList()
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data.map(toTenant));
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);

  return { data, loading, error, refetch };
};
