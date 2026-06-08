import { useState } from 'react';
import { workplaceApi } from '../api/api';
import type { Workplace } from './types';

interface Props { onSuccess: () => void; }

export const useDeleteWorkplaceAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWorkplace = async (workplace: Workplace) => {
    setIsLoading(true);
    setError(null);

    try {
      await workplaceApi.deleteWorkplace(workplace.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteWorkplace, isLoading, error };
};
