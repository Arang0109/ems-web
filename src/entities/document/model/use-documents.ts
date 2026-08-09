import { useState, useEffect, useCallback } from "react";

import { documentApi } from "../api/api";
import type { Document, DocumentCategory } from "./types";

interface Options {
  /** false면 조회하지 않는다. 모달이 닫혀 있는 동안 불필요한 요청을 막는 용도. 기본 true. */
  enabled?: boolean;
}

export const useDocuments = (category?: DocumentCategory, options?: Options) => {
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    documentApi.getDocuments(category)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, category, enabled]);

  return { data, loading, error, refetch };
};
