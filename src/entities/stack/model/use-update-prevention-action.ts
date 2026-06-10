import { useState } from 'react';
import { stackApi } from '../api/api';
import { toUpdatePreventionRequest } from '../api/mapper';
import type { PreventionUpdate } from './types';

export const useUpdatePreventionAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrevention = async (stackId: number, preventionId: number, data: PreventionUpdate) => {
    setIsLoading(true);
    setError(null);
    try {
      await stackApi.updatePrevention(stackId, preventionId, toUpdatePreventionRequest(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePrevention, isLoading, error };
};
