import { useState } from 'react';
import { stackApi } from '../api/api';
import { toRegisterPreventionRequest } from '../api/mapper';
import type { PreventionCreate } from './types';

export const useRegisterPreventionAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPrevention = async (data: PreventionCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await stackApi.registerPrevention(toRegisterPreventionRequest(data));
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

  return { registerPrevention, isLoading, error };
};
