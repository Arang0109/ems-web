import { useState } from "react";

import { documentApi } from "../api/api";

export const useDeleteDocumentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await documentApi.deleteDocument(id);
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
    deleteDocument,

    isLoading, error,
  };
};
