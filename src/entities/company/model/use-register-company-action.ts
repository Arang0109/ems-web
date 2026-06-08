import { useState } from "react";
import type { CompanyCreate } from "./types";
import { companyApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

interface Props { onSuccess: () => void; }

export const useRegisterCompanyAction = ({ onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCompany = async (data:CompanyCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      await companyApi.registerCompany(payload);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerCompany,

    isLoading, error,
  }
}