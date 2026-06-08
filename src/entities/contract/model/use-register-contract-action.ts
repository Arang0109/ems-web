import { useState } from 'react';
import { contractApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { ContractCreate } from './types';

export const useRegisterContractAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerContract = async (data: ContractCreate) => {
    setLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await contractApi.registerContract(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { registerContract, loading, error };
};
