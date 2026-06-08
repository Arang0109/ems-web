import { useState } from 'react';
import { pollutantApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCreate } from './types';

interface Props { onSuccess: () => void; }

export const useRegisterPollutantAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPollutant = async (data: PollutantCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await pollutantApi.registerPollutant(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { registerPollutant, isLoading, error };
};
