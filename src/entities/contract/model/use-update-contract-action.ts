import { useState } from 'react';
import { contractApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { ContractUpdate } from './types';

export const useUpdateContractAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateContract = async (id: number, data: ContractUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await contractApi.updateContract(id, payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateContract, isLoading, error };
};
