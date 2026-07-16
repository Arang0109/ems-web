import { useState } from "react";
import { memberApi } from "../api/api";

export const useDeleteMemberAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMember = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await memberApi.deleteMember(id);
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
    deleteMember,

    isLoading, error,
  }
}
