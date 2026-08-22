import { useState, useEffect, useCallback } from "react";

import { documentApi } from "../api/api";
import type { DocumentVersion } from "./types";

interface Props {
  /** null이면 조회하지 않는다. 상세 모달이 닫혀 있을 때 null을 넘겨 조회를 막는다. */
  documentId: number | null;
}

export const useDocumentVersions = ({ documentId }: Props) => {
  const [data, setData] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(documentId != null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  // 대상 문서가 바뀌면 이전 문서의 버전 목록을 즉시 비운다. 남겨두면 새 목록이 도착하기 전까지
  // 다른 문서의 버전이 선택 가능한 상태로 노출된다.
  // effect 안에서 동기적으로 setState 하면 cascading render 가 되므로 렌더 중에 조정한다.
  // (revision 만 바뀌는 재조회는 같은 문서이므로 비우지 않는다 — 목록이 깜빡이지 않게)
  const [activeId, setActiveId] = useState(documentId);
  if (activeId !== documentId) {
    setActiveId(documentId);
    setData([]);
    setError(null);
    // 조회할 문서가 없으면 로딩도 아니다 — 여기서 내려주지 않으면 호출부가 영영 로딩으로 본다.
    setLoading(documentId != null);
  }

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    if (documentId == null) return;

    let cancelled = false;
    documentApi.getDocumentVersions(documentId)
      .then((res) => {
        if (cancelled) return;
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => { if (!cancelled) setError('서버 연결에 실패했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, documentId]);

  return { data, loading, error, refetch };
};
