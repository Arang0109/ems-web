import { useState } from 'react';
import { contractApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { ContractCreate } from './types';

export const useRegisterContractAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerContract = async (data: ContractCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await contractApi.registerContract(payload);
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

  return { registerContract, isLoading, error };
};
