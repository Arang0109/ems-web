import { useState, useEffect, useCallback } from "react";

import { equipmentApi } from "../api/api";
import type { InspectionRecord } from "./types";

interface Props {
  equipmentId: string | null;
}

export const useInspectionRecords = ({ equipmentId }: Props) => {
  const [data, setData] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (equipmentId == null) return;
    let cancelled = false;
    equipmentApi.getInspectionRecords(equipmentId)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, equipmentId]);

  return { data, loading, error, refetch };
};
