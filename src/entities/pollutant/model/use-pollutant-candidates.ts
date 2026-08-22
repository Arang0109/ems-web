import { useState, useEffect, useCallback } from "react";

import type { PollutantCandidate } from "./types";
import { pollutantApi } from "../api/api";
import { toPollutantCandidates } from "../api/mapper";

import { ERROR_MESSAGE } from "@shared/config";
import type { MeasurementField } from "@shared/model";

interface Props {
  /** 지정하면 그 측정분야만 조회한다 */
  field?: MeasurementField;
  /** false 면 조회하지 않는다 — 등록 모달이 닫혀 있는 동안 불필요한 요청을 막는다 */
  enabled?: boolean;
}

/**
 * 아직 채택하지 않은 가이드 항목. 측정물질 등록 화면에서 고를 후보다.
 *
 * 이미 채택한 항목은 서버가 빼고 내려주므로, 채택 직후 `refetch` 하면 방금 고른 항목이 목록에서 사라진다.
 */
export const usePollutantCandidates = ({ field, enabled = true }: Props = {}) => {
  const [data, setData] = useState<PollutantCandidate[]>([]);
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

    pollutantApi.getPollutantCandidates({ field })
      .then((res) => {
        if (cancelled) return;
        if (res.status) { setData(toPollutantCandidates(res.data)); setError(null); }
        else setError(res.message ?? ERROR_MESSAGE.FETCH);
      })
      .catch(() => { if (!cancelled) setError(ERROR_MESSAGE.NETWORK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, field, enabled]);

  return { data, loading, error, refetch };
}
