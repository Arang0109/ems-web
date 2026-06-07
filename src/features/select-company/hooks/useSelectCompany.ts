import { useState } from 'react';

import type { Company } from '@entities/company';
import { workplaceApi } from '@entities/workplace';
import type { WorkplaceListItem } from '@entities/workplace';

export const useSelectCompany = (onCompanyChange?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [workplaceData, setWorkplaceData] = useState<WorkplaceListItem[]>([]);

  const fetchWorkplaces = async (companyId: number) => {
    setIsLoading(true);
    setError(null);
    setWorkplaceData([]);
    try {
      const res = await workplaceApi.getWorkplaces(companyId);
      setWorkplaceData(res.data);
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompanyRow = (company: Company) => {
    setSelectedCompany(company);
    onCompanyChange?.();
    fetchWorkplaces(company.id);
  };

  const refetchWorkplaces = () => {
    if (selectedCompany?.id) fetchWorkplaces(selectedCompany.id);
  };

  return {
    selectedCompany,
    workplaceData,
    isLoading,
    error,
    handleSelectCompanyRow,
    refetchWorkplaces,
  };
};
