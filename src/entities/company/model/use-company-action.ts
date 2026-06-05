import { useState } from 'react';
import { companyApi } from '../api/api';
import type { CompanyUpdateRequest } from '../api/dtos';

interface UseCompanyActionProps {
  onSuccess?: () => void;
}

export const useCompanyAction = ({ onSuccess }: UseCompanyActionProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (id: number, data: CompanyUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      await companyApi.updateCompany(id, data);
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
      await companyApi.deleteCompany(id);
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
};
