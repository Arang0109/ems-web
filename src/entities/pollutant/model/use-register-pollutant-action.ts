import { useState } from 'react';
import { pollutantApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCreate } from './types';

export const useRegisterPollutantAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPollutant = async (data: PollutantCreate) => {
    setLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await pollutantApi.registerPollutant(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { registerPollutant, loading, error };
};
