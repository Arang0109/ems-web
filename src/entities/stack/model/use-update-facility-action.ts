import { useState } from 'react';
import { stackApi } from '../api/api';
import { toUpdateFacilityRequest } from '../api/mapper';
import type { FacilityUpdate } from './types';

export const useUpdateFacilityAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFacility = async (stackId: number, facilityId: number, data: FacilityUpdate) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await stackApi.updateFacility(stackId, facilityId, toUpdateFacilityRequest(data));
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

  return { updateFacility, isLoading, error };
};
