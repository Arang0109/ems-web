import { useState, useCallback } from "react";

import type { StackMeasurementListItem } from "./types";
import { toStackMeasurementListItems } from "../api/mapper";
import { stackMeasurementApi } from "../api/api";

export const useStackMeasurements = () => {
  const [data, setData] = useState<StackMeasurementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStackMeasurements = useCallback(async (stackId: number | null) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const res = await stackMeasurementApi.getStackMeasurements(stackId);
      setData(toStackMeasurementListItems(res.data));
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStackMeasurements };
}