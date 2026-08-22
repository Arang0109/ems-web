import { useState, useEffect, useCallback } from "react";

import { documentApi } from "../api/api";
import type { DocumentCategory } from "@shared/model";

import type { Document } from "./types";

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

  // 조회 조건(분류·활성 여부)이 바뀌면 즉시 로딩 상태로 되돌린다.
  // effect 안에서 동기적으로 setState 하면 cascading render 가 되므로 렌더 중에 조정한다.
  // 비활성으로 바뀌면 로딩도 아니다 — 여기서 내려주지 않으면 호출부가 영영 로딩으로 본다.
  const requestKey = `${category ?? ''}|${enabled}`;
  const [activeKey, setActiveKey] = useState(requestKey);
  if (activeKey !== requestKey) {
    setActiveKey(requestKey);
    setLoading(enabled);
  }

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
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
