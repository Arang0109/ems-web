import { useState, useEffect, useCallback } from 'react';

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

  const fetchWorkplaces = useCallback(async (companyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setWorkplaceData([]);

      const res = await workplaceApi.getWorkplacesByCompany(companyId);
      setWorkplaceData(res.data);
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCompany?.id) return;
    fetchWorkplaces(selectedCompany.id);
  }, [selectedCompany?.id, fetchWorkplaces]);

  const refetchWorkplaces = useCallback(() => {
    if (selectedCompany?.id) fetchWorkplaces(selectedCompany.id);
  }, [selectedCompany?.id, fetchWorkplaces]);

  return {
    selectedCompany,
    workplaceData,

    isLoading, error,

    handleSelectCompanyRow,
    refetchWorkplaces,
  }
}
