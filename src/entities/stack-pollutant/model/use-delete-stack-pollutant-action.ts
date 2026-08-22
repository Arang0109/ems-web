import { useState } from "react";

import { stackPollutantApi } from "../api/api";

export const useDeleteStackPollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStackPollutant = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await stackPollutantApi.deleteStackPollutant(id);
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

  return { deleteStackPollutant, isLoading, error };
};
