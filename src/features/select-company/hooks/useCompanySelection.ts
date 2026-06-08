import { useState } from 'react';

import type { Company } from '@entities/company';
import { useWorkplaces } from '@entities/workplace';

interface Props {
  onChange: () => void;
}

export const useCompanySelection = ({ onChange }: Props) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { data: workplaces, fetchWorkplaces, loading, error} = useWorkplaces();

  const handleSelectCompanyRow = (company: Company) => {
    setSelectedCompany(company);
    onChange?.();
    fetchWorkplaces(company.id);
  };

  const refetchWorkplaces = () => {
    if (selectedCompany?.id) fetchWorkplaces(selectedCompany.id);
  };

  return {
    workplaces,
    selectedCompany,
    
    handleSelectCompanyRow,
    refetchWorkplaces,
    
    loading,
    error,
  };
};
