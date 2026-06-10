import { useState } from 'react';
import { workplaceApi } from '../api/api';

export const useDeleteWorkplaceAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWorkplace = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await workplaceApi.deleteWorkplace(id);
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

  return { deleteWorkplace, isLoading, error };
};
