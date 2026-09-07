import { useState } from "react";

import { useStacks } from "@entities/stack";
import type { WorkplaceListItem, Workplace } from "@entities/workplace";

const toWorkplace = (item: WorkplaceListItem): Workplace => ({
  id: item.id,
  clientId: item.clientId,
  name: item.workplaceName,
  bizNumber: item.bizNumber,
  businessCategory: item.businessCategory,
  zipcode: item.zipcode,
  roadAddress: item.roadAddress,
  detailAddress: item.detailAddress,
  facilityManager: item.facilityManager,
  samplingWitness: item.samplingWitness,
  grade: item.grade,
});

export const useWorkplaceSelection = () => {
  const [selectedWorkplaceItem, setSelectedWorkplaceItem] = useState<WorkplaceListItem | null>(null);

  // 선택된 사업장이 바뀌면 측정시설 목록이 따라온다.
  const { data: stacks, isLoading, error, refetch: refetchStacks } =
    useStacks(selectedWorkplaceItem?.id ?? null, { enabled: selectedWorkplaceItem != null });

  const selectedWorkplace: Workplace | null = selectedWorkplaceItem
    ? toWorkplace(selectedWorkplaceItem)
    : null;

  const handleSelectWorkplaceRow = (workplace: WorkplaceListItem) => {
    setSelectedWorkplaceItem(workplace);
  };

  const clearWorkplaceSelection = () => {
    setSelectedWorkplaceItem(null);
  };

  return {
    stacks, selectedWorkplace,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,

    isLoading, error,
  }
}
