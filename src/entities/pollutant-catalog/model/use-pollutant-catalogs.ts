import { useState, useEffect, useCallback } from "react";

import type { PollutantCatalog } from "./types";
import { pollutantCatalogApi } from "../api/api";
import { toPollutantCatalogs } from "../api/mapper";

import { ERROR_MESSAGE } from "@shared/config";
import type { MeasurementField } from "@shared/model";

interface Props {
  field?: MeasurementField;
  /** true 면 폐지된 항목도 함께 받는다. 운영 화면은 켜 두는 편이 낫다 */
  includeInactive?: boolean;
}

export const usePollutantCatalogs = ({ field, includeInactive }: Props = {}) => {
  const [data, setData] = useState<PollutantCatalog[]>([]);
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

    pollutantCatalogApi.getPollutantCatalogs({ field, includeInactive })
      .then((res) => {
        if (cancelled) return;
        // 성공 시 직전 조회의 에러를 지운다. effect 안에서 동기적으로 지우면 cascading render 가 된다.
        if (res.status) { setData(toPollutantCatalogs(res.data)); setError(null); }
        else setError(res.message ?? ERROR_MESSAGE.FETCH);
      })
      .catch(() => { if (!cancelled) setError(ERROR_MESSAGE.NETWORK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision, field, includeInactive]);

  return { data, loading, error, refetch };
}
