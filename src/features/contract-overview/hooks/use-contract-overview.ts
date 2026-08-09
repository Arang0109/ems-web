import { useState, useEffect } from 'react';
import { workplaceApi } from '@entities/workplace';

import type { ContractOverview } from '@entities/workplace';

import { ERROR_MESSAGE } from "@shared/config";

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
        setError(ERROR_MESSAGE.FETCH);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractSummary();
  }, []);

  return { summary, isLoading, error };
}