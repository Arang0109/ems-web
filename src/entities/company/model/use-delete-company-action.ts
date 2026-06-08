import { useState } from "react";
import { companyApi } from "../api/api";

export const useDeleteCompanyAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCompany = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await companyApi.deleteCompany(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCompany,

    isLoading, error,
  }
}