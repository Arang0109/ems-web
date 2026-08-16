import { useState } from 'react';
import { pollutantApi } from '../api/api';

export const useDeletePollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePollutant = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await pollutantApi.deletePollutant(id);
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

  return { deletePollutant, isLoading, error };
};
