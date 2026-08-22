import { useState, useCallback } from "react";

import type { StackDetail } from "./types";
import { getStackDetailDefault } from "./types";
import { toStackDetail } from "../api/mapper";
import { stackApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

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
      const detail = toStackDetail(res.data);
      setData(detail);
    } catch {
      setError(ERROR_MESSAGE.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStack }
}