import { useState } from 'react';
import { stackApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { StackUpdate } from './types';

export const useUpdateStackAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStack = async (id: number, data: StackUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await stackApi.updateStack(id, payload);
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

  return { updateStack, isLoading, error };
};
