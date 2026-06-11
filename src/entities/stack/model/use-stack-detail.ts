import { useState, useCallback } from "react";

import type { StackDetail } from "./types";
import { getStackDetailDefault } from "./types";
import { toStackDetail } from "../api/mapper";
import { stackApi } from "../api/api";

export const useStackDetail = () => {
  const [data, setData] = useState<StackDetail>(getStackDetailDefault());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStack = useCallback(async (stackId: number) => {
    setLoading(true);
    setError(null);
    setData(getStackDetailDefault());

    try {
      const res = await stackApi.getStack(stackId);
      setData(toStackDetail(res.data));
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStack }
}