import { useState } from 'react';
import { stackApi } from '../api/api';

export const useDeleteFacilityAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFacility = async (stackId: number, facilityId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await stackApi.deleteFacility(stackId, facilityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteFacility, isLoading, error };
};
