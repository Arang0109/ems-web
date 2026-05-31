import { useState, useEffect } from "react";

import type { Stack } from "@entities/stack";
import { stackApi } from "@entities/stack";

export const useStacks = () => {
  const [data, setData] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stackApi.getStacks()
      .then((res) => {
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}