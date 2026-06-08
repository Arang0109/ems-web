import { useState, useCallback } from "react";

import type { WorkplaceListItem } from "./types";
import { toWorkplaceListItems } from "../api/mapper";
import { workplaceApi } from "../api/api";

export const useWorkplaces = () => {
  const [data, setData] = useState<WorkplaceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkplaces = useCallback(async (companyId: number | null) => {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      const res = await workplaceApi.getWorkplaces(companyId);
      setData(toWorkplaceListItems(res.data));
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,

    fetchWorkplaces,
  }
}
