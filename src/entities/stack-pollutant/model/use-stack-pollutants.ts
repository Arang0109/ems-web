import { useState, useCallback } from "react";

import type { StackPollutantListItem } from "./types";
import { toStackPollutantListItems } from "../api/mapper";
import { stackPollutantApi } from "../api/api";

export const useStackPollutants = () => {
  const [data, setData] = useState<StackPollutantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStackPollutants = useCallback(async (stackId: number | null) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const res = await stackPollutantApi.getStackPollutants(stackId);
      setData(toStackPollutantListItems(res.data));
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStackPollutants };
}