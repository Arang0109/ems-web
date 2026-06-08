import { useState } from "react";

import type { Workplace } from "@entities/workplace";
import { useStacks } from "@entities/stack";

export const useWorkplaceSelection = () => {
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);

  const { data: stacks, fetchStacks, loading, error } = useStacks();

  const handleSelectWorkplaceRow = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
    fetchStacks(workplace.id);
  };

  const clearWorkplaceSelection = () => {
    setSelectedWorkplace(null);
  };

  const refetchStacks = () => {
    if (selectedWorkplace?.id) fetchStacks(selectedWorkplace.id);
  };

  return {
    stacks,
    selectedWorkplace,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,
    
    loading, error,
  }
}
