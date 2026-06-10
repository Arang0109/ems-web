import { useState } from 'react';

import { useCompanyDetail } from '@entities/company';
import { useWorkplaces } from '@entities/workplace';

interface Props {
  onChange: () => void;
}

export const useCompanySelection = ({ onChange }: Props) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const { data: workplaces, fetchWorkplaces, loading, error} = useWorkplaces();

  const { data: selectedCompany } = useCompanyDetail({
    companyId: selectedCompanyId,
  });

  const handleSelectCompanyRow = (companyId: number) => {
    setSelectedCompanyId(companyId);
    onChange?.();
    fetchWorkplaces(companyId);
  };

  const refetchWorkplaces = () => { if (selectedCompanyId) fetchWorkplaces(selectedCompanyId); };

  return {
    workplaces, selectedCompany,
    
    handleSelectCompanyRow,
    refetchWorkplaces,
    
    loading, error,
  };
};
