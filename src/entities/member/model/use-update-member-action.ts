import { useState } from "react";
import type { MemberUpdate } from "./types";
import { memberApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateMemberAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMember = async (id: number, data: MemberUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await memberApi.updateMember(id, payload);
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
    updateMember,

    isLoading, error,
  }
}
