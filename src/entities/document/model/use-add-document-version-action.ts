import { useState } from "react";

import { documentApi } from "../api/api";
import { toAddVersionRequest } from "../api/mapper";
import type { DocumentVersionCreate } from "./types";

export const useAddDocumentVersionAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 부여된 versionNo를 반환한다. */
  const addDocumentVersion = async (id: number, data: DocumentVersionCreate): Promise<number> => {
    setIsLoading(true);
    setError(null);

    const payload = toAddVersionRequest(data);

    try {
      const result = await documentApi.addDocumentVersion(id, payload);
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
    addDocumentVersion,

    isLoading, error,
  };
};
