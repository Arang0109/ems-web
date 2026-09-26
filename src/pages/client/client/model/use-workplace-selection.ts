import { useState } from "react";

import { useStacks } from "@entities/stack";
import type { WorkplaceListItem } from "@entities/workplace";

export const useWorkplaceSelection = () => {
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceListItem | null>(null);

  // 선택된 사업장이 바뀌면 측정시설 목록이 따라온다.
  const { data: stacks, isLoading, error, refetch: refetchStacks } =
    useStacks(selectedWorkplace?.id ?? null, { enabled: selectedWorkplace != null });

  const handleSelectWorkplaceRow = (workplace: WorkplaceListItem) => {
    setSelectedWorkplace(workplace);
  };

  const clearWorkplaceSelection = () => {
    setSelectedWorkplace(null);
  };

  return {
    stacks, selectedWorkplace,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,

    isLoading, error,
  }
}
