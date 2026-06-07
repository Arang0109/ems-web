import { useState, useCallback } from 'react';

import type { ContractDetail } from './types';
import { contractApi } from '../api/api';

export const useContractDetail = () => {
  const [data, setData] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = useCallback(async (contractId: number) => {
    setLoading(true);
    setError(null);
    try {
      const { status, data } = await contractApi.getContract(contractId);
      setData(status ? data : null);
    } catch (e) {
      console.error(e);
      setError('계약 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,

    fetchContract,
    
    loading,
    error,
  };
};