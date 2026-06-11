import { useState } from 'react';
import { stackApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { StackCreate } from './types';

export const useRegisterStackAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerStack = async (data: StackCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await stackApi.registerStack(payload);
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

  return { registerStack, isLoading, error };
};
