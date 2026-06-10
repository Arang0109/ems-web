import { useState } from 'react';
import { stackApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { StackUpdate } from './types';

export const useUpdateStackAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStack = async (id: number, data: StackUpdate) => {
    setLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      await stackApi.updateStack(id, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { updateStack, loading, error };
};
