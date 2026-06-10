import { useState } from 'react';
import { pollutantApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCreate } from './types';

export const useRegisterPollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPollutant = async (data: PollutantCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await pollutantApi.registerPollutant(payload);
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

  return { registerPollutant, isLoading, error };
};
