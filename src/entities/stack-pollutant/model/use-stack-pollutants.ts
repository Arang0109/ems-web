import { useState, useCallback } from "react";

import type { StackPollutantListItem } from "./types";
import { toStackPollutantListItems } from "../api/mapper";
import { stackPollutantApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

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
      setError(ERROR_MESSAGE.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStackPollutants };
}