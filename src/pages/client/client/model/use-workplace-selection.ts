import { useState } from "react";

import { useStacks } from "@entities/stack";
import type { WorkplaceListItem, Workplace } from "@entities/workplace";

const toWorkplace = (item: WorkplaceListItem): Workplace => ({
  id: item.id,
  clientId: item.clientId,
  name: item.workplaceName,
  bizNumber: item.bizNumber,
  zipcode: item.zipcode,
  roadAddress: item.roadAddress,
  detailAddress: item.detailAddress,
  facilityManager: item.facilityManager,
  samplingWitness: item.samplingWitness,
  grade: item.grade,
});

export const useWorkplaceSelection = () => {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null);
  const [selectedWorkplaceItem, setSelectedWorkplaceItem] = useState<WorkplaceListItem | null>(null);

  const { data: stacks, fetchStacks, loading, error } = useStacks();

  const selectedWorkplace: Workplace | null = selectedWorkplaceItem
    ? toWorkplace(selectedWorkplaceItem)
    : null;

  const handleSelectWorkplaceRow = (workplace: WorkplaceListItem) => {
    setSelectedWorkplaceId(workplace.id);
    setSelectedWorkplaceItem(workplace);
    fetchStacks(workplace.id);
  };

  const refetchStacks = () => {
    if (selectedWorkplaceId) fetchStacks(selectedWorkplaceId);
  };

  const clearWorkplaceSelection = () => {
    setSelectedWorkplaceId(null);
    setSelectedWorkplaceItem(null);
  };

  return {
    stacks, selectedWorkplace,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,

    loading, error,
  }
}
