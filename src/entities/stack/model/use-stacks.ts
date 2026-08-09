import { useState } from "react";

import type { StackListItem } from "./types";
import { toStackListItems } from "../api/mapper";
import { stackApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

export const useStacks = () => {
  const [data, setData] = useState<StackListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStacks = async (workplaceId: number | null) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const res = await stackApi.getStacks(workplaceId);
      setData(toStackListItems(res.data));
    } catch {
      setError(ERROR_MESSAGE.FETCH);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchStacks };
}