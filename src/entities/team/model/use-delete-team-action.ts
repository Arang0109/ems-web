import { useState } from "react";
import { teamApi } from "../api/api";

export const useDeleteTeamAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTeam = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await teamApi.deleteTeam(id);
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

  return {
    deleteTeam,

    isLoading, error,
  }
}
