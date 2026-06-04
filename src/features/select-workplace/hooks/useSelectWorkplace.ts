import { useState, useEffect, useCallback } from "react";

import type { Workplace } from "@entities/workplace";
import { stackApi } from "@entities/stack";
import type { StackTableListResponse } from "@entities/stack";

export const useSelectWorkplace = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const [stackData, setStackData] = useState<StackTableListResponse[]>([]);

  const handleSelectWorkplaceRow = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
  };

  const clearWorkplaceSelection = () => {
    setSelectedWorkplace(null);
    setStackData([]);
  };

  const fetchStacks = useCallback(async (workplaceId: number) => {
    try {
      setIsLoading(true);
      setStackData([]);
      const res = await stackApi.getStacksByWorkplace(workplaceId);
      setStackData(res.data);
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWorkplace == null) return;
    fetchStacks(selectedWorkplace.id);
  }, [selectedWorkplace, fetchStacks]);

  const refetchStacks = useCallback(() => {
    if (selectedWorkplace?.id) fetchStacks(selectedWorkplace.id);
  }, [selectedWorkplace?.id, fetchStacks]);

  return {
    selectedWorkplace,
    stackData,

    isLoading, error,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,
  }
}
