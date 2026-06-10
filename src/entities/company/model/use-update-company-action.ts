import { useState } from "react";
import type { CompanyUpdate } from "./types";
import { companyApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateCompanyAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompany = async (id: number, data: CompanyUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await companyApi.updateCompany(id, payload);
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

  return {
    updateCompany,

    isLoading, error,
  }
}