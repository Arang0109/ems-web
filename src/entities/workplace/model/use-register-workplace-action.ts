import { useState } from 'react';
import { workplaceApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { WorkplaceCreate } from './types';

export const useRegisterWorkplaceAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerWorkplace = async (data: WorkplaceCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await workplaceApi.registerWorkplace(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { registerWorkplace, isLoading, error };
};
