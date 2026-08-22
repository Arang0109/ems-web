import { useState } from "react";

import type { StackPollutantUpdate } from "./types";
import { stackPollutantApi } from "../api/api";
import { toUpdateStackPollutantRequest } from "../api/mapper";

export const useUpdateStackPollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStackPollutant = async (id: number, data: StackPollutantUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateStackPollutantRequest(data);

    try {
      const result = await stackPollutantApi.updateStackPollutant(id, payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '서버 연결에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStackPollutant, isLoading, error };
};
