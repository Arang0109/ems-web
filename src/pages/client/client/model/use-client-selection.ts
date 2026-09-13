import { useState } from 'react';

import { useClientDetail } from '@entities/client';
import { useWorkplaces } from '@entities/workplace';

interface Props {
  onChange: () => void;
}

export const useClientSelection = ({ onChange }: Props) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // 선택된 의뢰기관이 바뀌면 사업장 목록이 따라온다 — 명시적 트리거가 필요 없다.
  const { data: workplaces, isLoading, error, refetch: refetchWorkplaces } =
    useWorkplaces(selectedClientId, { enabled: selectedClientId != null });

  const { data: selectedClient } = useClientDetail(selectedClientId);

  const handleSelectClientRow = (clientId: number) => {
    setSelectedClientId(clientId);
    onChange?.();
  };

  return {
    workplaces, selectedClient,

    handleSelectClientRow,
    refetchWorkplaces,

    isLoading, error,
  };
};
