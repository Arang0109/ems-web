import { useState } from 'react';
import { workplaceApi } from '../api/api';
import type { WorkplaceUpdate } from './types';

interface UseWorkplaceActionProps {
  onSuccess?: () => void;
}

export const useWorkplaceAction = ({ onSuccess }: UseWorkplaceActionProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (id: number, data: WorkplaceUpdate) => {
    setLoading(true);
    setError(null);

    try {
      await workplaceApi.updateWorkplace(id, data);
      onSuccess?.();
    } catch (err: unknown) {
      setError((err as Error).message ?? '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await workplaceApi.deleteWorkplace(id);
      onSuccess?.();
    } catch (err: unknown) {
      setError((err as Error).message ?? '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    handleEdit,
    handleDelete,
  };
}
