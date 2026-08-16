import { useState } from 'react';
import { pollutantApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantUpdate } from './types';

export const useUpdatePollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePollutant = async (id: number, data: PollutantUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await pollutantApi.updatePollutant(id, payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '서버 연결에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePollutant, isLoading, error };
};
