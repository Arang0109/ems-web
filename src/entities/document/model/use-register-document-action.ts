import { useState } from "react";

import { documentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import type { DocumentCreate } from "./types";

export const useRegisterDocumentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 생성된 documentId를 반환한다. */
  const registerDocument = async (data: DocumentCreate): Promise<number> => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await documentApi.registerDocument(payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerDocument,

    isLoading, error,
  };
};
