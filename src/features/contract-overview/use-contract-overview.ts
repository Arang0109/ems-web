import { useState, useEffect } from 'react';
import { workplaceApi } from '@entities/workplace';

import type { ContractOverview } from '@entities/workplace';

export const useContractOverview = () => {
  const [summary, setSummary] = useState<ContractOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractSummary = async () => {
      try {
        setIsLoading(true);
        const summaryData = await workplaceApi.getContractOverview();
        setSummary(summaryData.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractSummary();
  }, []);

  return { summary, isLoading, error };
}