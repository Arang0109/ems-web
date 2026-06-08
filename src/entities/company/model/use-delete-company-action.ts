import { useState } from "react";
import { companyApi } from "../api/api";
import type { Company } from "./types";

interface Props { onSuccess: () => void; }

export const useDeleteCompanyAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCompany = async (company: Company) => {
    setIsLoading(true);
    setError(null);

    try {
      await companyApi.deleteCompany(company.id);
      onSuccess?.();
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