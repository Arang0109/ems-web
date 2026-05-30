import { useState, useEffect } from 'react';

import type { Company } from '@entities/company';
import type { WorkplaceTableCols } from '@entities/workplace';
import { workplaceApi } from '@entities/workplace';

export const useSelectCompany = (onCompanyChange?: () => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [workplaceTableData, setWorkplaceTableData] = useState<WorkplaceTableCols[]>([]);

  const handleSelectCompanyRow = (company: Company) => {
    setSelectedCompany(company);
    onCompanyChange?.();
  }

  useEffect(() => {
    const fetchWorkplaceTable = async () => {
      try {
        if (selectedCompany == null) return;
        setIsLoading(true);
        setWorkplaceTableData([]);
        const res = await workplaceApi.getWorkplacesByCompany(selectedCompany.id);
        setWorkplaceTableData(res.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkplaceTable();

  }, [selectedCompany])

  return {
    selectedCompany,
    workplaceTableData,

    isLoading, error,

    handleSelectCompanyRow
  }
}