import { useState, useCallback } from "react";

import type { WorkplaceListItem } from "./types";
import { toWorkplaceListItems } from "../api/mapper";
import { workplaceApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

export const useWorkplaces = () => {
  const [data, setData] = useState<WorkplaceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkplaces = useCallback(async (clientId: number | null) => {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      const res = await workplaceApi.getWorkplaces(clientId);
      setData(toWorkplaceListItems(res.data));
    } catch {
      setError(ERROR_MESSAGE.FETCH);
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
