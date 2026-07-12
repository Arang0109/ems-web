import { useState } from 'react';

import { useClientDetail } from '@entities/client';
import { useWorkplaces } from '@entities/workplace';

interface Props {
  onChange: () => void;
}

export const useClientSelection = ({ onChange }: Props) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { data: workplaces, fetchWorkplaces, loading, error} = useWorkplaces();

  const { data: selectedClient } = useClientDetail({
    id: selectedClientId,
  });

  const handleSelectClientRow = (clientId: number) => {
    setSelectedClientId(clientId);
    onChange?.();
    fetchWorkplaces(clientId);
  };

  const refetchWorkplaces = () => {
    fetchWorkplaces(selectedClientId);
  };

  return {
    workplaces, selectedClient,

    handleSelectClientRow,
    refetchWorkplaces,

    loading, error,
  };
};
