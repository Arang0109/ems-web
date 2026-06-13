import { useState } from 'react';
import { stackApi } from '../api/api';
import { toRegisterSubstanceRequest } from '../api/mapper';
import type { TargetSubstanceCreate } from './types';

export const useRegisterSubstanceAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerSubstance = async (data: TargetSubstanceCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await stackApi.registerSubstance(toRegisterSubstanceRequest(data));
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

  return { registerSubstance, isLoading, error };
};
