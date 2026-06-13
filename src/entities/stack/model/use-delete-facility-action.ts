import { useState } from 'react';
import { stackApi } from '../api/api';

export const useDeleteFacilityAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFacility = async (facilityId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await stackApi.deleteFacility(facilityId);
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

  return { deleteFacility, isLoading, error };
};
