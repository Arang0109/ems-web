import { useState } from 'react';
import { workplaceApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { WorkplaceUpdate } from './types';

interface Props { onSuccess: () => void; }

export const useUpdateWorkplaceAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkplace = async (id: number, data: WorkplaceUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      await workplaceApi.updateWorkplace(id, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { updateWorkplace, isLoading, error };
};
