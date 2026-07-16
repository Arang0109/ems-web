import { useState } from "react";
import type { TeamUpdate } from "./types";
import { teamApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateTeamAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeam = async (id: number, data: TeamUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await teamApi.updateTeam(id, payload);
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
    updateTeam,

    isLoading, error,
  }
}
