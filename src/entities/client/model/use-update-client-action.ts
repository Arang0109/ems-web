import { useState } from "react";
import type { ClientUpdate } from "./types";
import { clientApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateClientAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateClient = async (id: number, data: ClientUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await clientApi.updateClient(id, payload);
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
    updateClient,

    isLoading, error,
  }
}