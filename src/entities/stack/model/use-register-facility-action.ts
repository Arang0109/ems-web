import { useState } from 'react';
import { stackApi } from '../api/api';
import { toRegisterFacilityRequest } from '../api/mapper';
import type { FacilityCreate } from './types';

export const useRegisterFacilityAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerFacility = async (stackId: number, data: FacilityCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterFacilityRequest(data);

    try {
      const result = await stackApi.registerFacility(stackId, payload);
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

  return { registerFacility, isLoading, error };
};
