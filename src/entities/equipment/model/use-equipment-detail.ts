import { useState, useEffect, useCallback } from "react";

import { equipmentApi } from "../api/api";
import type { Equipment } from "./types";

interface Props {
  id: string | null;
}

export const useEquipmentDetail = ({ id }: Props) => {
  const [data, setData] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (id == null) return;
    let cancelled = false;
    equipmentApi.getEquipment(id)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, id]);

  return { data, loading, error, refetch };
};
