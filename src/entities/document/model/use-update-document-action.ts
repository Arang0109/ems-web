import { useState } from "react";

import { documentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import type { DocumentUpdate } from "./types";

export const useUpdateDocumentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDocument = async (id: number, data: DocumentUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await documentApi.updateDocument(id, payload);
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
    updateDocument,

    isLoading, error,
  };
};
