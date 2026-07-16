import { useState } from "react";
import type { MemberCreate } from "./types";
import { memberApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterMemberAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMember = async (data: MemberCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await memberApi.registerMember(payload);
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
    registerMember,

    isLoading, error,
  }
}
