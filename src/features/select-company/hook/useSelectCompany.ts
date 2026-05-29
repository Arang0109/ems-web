import { useState, useEffect } from 'react';

import type {  Company, WorkplaceTableCols } from '@entities/company';
import { companyApi } from '@entities/company';

export const useSelectCompany = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [workplaceTableData, setWorkplaceTableData] = useState<WorkplaceTableCols[]>([]);

  const handleSelectCompanyRow = (company: Company) => {
    setSelectedCompanyId(company.id);
  }

  useEffect(() => {
    const fetchWorkplaceTable = async () => {
      try {
        if (selectedCompanyId==null) return;
        setIsLoading(true);
        setWorkplaceTableData([]);
        const res = await companyApi.getCompanyWorkplaces(selectedCompanyId);
        setWorkplaceTableData(res.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkplaceTable();
    
  }, [selectedCompanyId])

  return {
    selectedCompanyId,
    workplaceTableData,

    isLoading, error,

    handleSelectCompanyRow
  }
}