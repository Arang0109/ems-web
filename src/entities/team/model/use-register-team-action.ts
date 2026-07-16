import { useState } from "react";
import type { TeamCreate } from "./types";
import { teamApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterTeamAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerTeam = async (data: TeamCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await teamApi.registerTeam(payload);
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
    registerTeam,

    isLoading, error,
  }
}
