import { useState, useEffect } from 'react';

import type { Company } from '@entities/company';
import { workplaceApi } from '@entities/workplace';
import type { WorkplaceTableListResponse } from '@entities/workplace';

export const useSelectCompany = (onCompanyChange?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [workplaceData, setWorkplaceData] = useState<WorkplaceTableListResponse[]>([]);

  const handleSelectCompanyRow = (company: Company) => {
    setSelectedCompany(company);
    onCompanyChange?.();
  };

  useEffect(() => {
    if (!selectedCompany?.id) return;

    const fetchWorkplaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setWorkplaceData([]);

        const res = await workplaceApi.getWorkplacesByCompany(selectedCompany.id);
        setWorkplaceData(res.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkplaces();
  }, [selectedCompany?.id]);

  return {
    selectedCompany,
    workplaceData,

    isLoading, error,

    handleSelectCompanyRow
  }
}
