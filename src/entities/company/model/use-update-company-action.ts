import { useState } from "react";
import type { CompanyUpdate } from "./types";
import { companyApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

interface Props { onSuccess: () => void; }

export const useUpdateCompanyAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompany = async (id: number, data: CompanyUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      await companyApi.updateCompany(id, payload);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCompany,

    isLoading, error,
  }
}