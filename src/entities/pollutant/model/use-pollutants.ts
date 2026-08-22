import { useState, useEffect, useCallback } from "react";

import type { Pollutant } from "./types";
import { pollutantApi } from "../api/api";
import { toPollutants } from "../api/mapper";

import { ERROR_MESSAGE } from "@shared/config";
import type { MeasurementField } from "@shared/model";

interface Props {
  /** 지정하면 그 측정분야만 조회한다 */
  field?: MeasurementField;
}

/**
 * 이 고객사가 채택한 측정물질 목록.
 *
 * 가이드에만 있고 아직 채택하지 않은 항목은 오지 않는다 — 채택 후보는 `usePollutantCandidates` 로
 * 따로 조회한다. 그래서 한 번도 채택하지 않은 고객사는 빈 목록을 본다.
 */
export const usePollutants = ({ field }: Props = {}) => {
  const [data, setData] = useState<Pollutant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRevision((r) => r + 1);
  }, []);

  // 객체를 그대로 의존성에 두면 매 렌더 새 참조라 무한 재조회가 된다 — 원시값으로 편다.
  useEffect(() => {
    let cancelled = false;

    pollutantApi.getPollutants({ field })
      .then((res) => {
        if (cancelled) return;
        // 성공 시 직전 조회의 에러를 지운다. effect 안에서 동기적으로 지우면 cascading render 가 된다.
        if (res.status) { setData(toPollutants(res.data)); setError(null); }
        else setError(res.message ?? ERROR_MESSAGE.FETCH);
      })
      .catch(() => { if (!cancelled) setError(ERROR_MESSAGE.NETWORK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, field]);

  return { data, loading, error, refetch };
}
