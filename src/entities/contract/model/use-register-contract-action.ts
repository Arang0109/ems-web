import { useState } from 'react';
import { contractApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { ContractCreate } from './types';

interface Props { onSuccess: () => void; }

export const useRegisterContractAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerContract = async (data: ContractCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await contractApi.registerContract(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { registerContract, isLoading, error };
};
