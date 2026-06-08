import { useState } from "react";

import type { StackListItem } from "./types";
import { toStackListItems } from "../api/mapper";
import { stackApi } from "../api/api";

export const useStacks = () => {
  const [data, setData] = useState<StackListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStacks = async (workplaceId: number) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const res = await stackApi.getStacks(workplaceId);
      setData(toStackListItems(res.data));
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchStacks };
}