import { useState } from 'react';

import { pollutantCatalogApi } from '../api/api';

import { ERROR_MESSAGE } from '@shared/config';

/**
 * 카탈로그 폐지/해제.
 *
 * 삭제 API 가 따로 없는 것은 의도된 설계다 — 이미 그 물질을 등록해 쓰고 있는 고객사와
 * 과거 측정계획 스냅샷이 있으므로, 지우는 대신 선택 목록에서만 감춘다.
 */
export const useTogglePollutantCatalogAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPollutantCatalogActive = async (id: number, active: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = active
        ? await pollutantCatalogApi.activatePollutantCatalog(id)
        : await pollutantCatalogApi.deactivatePollutantCatalog(id);
      if (!result.status) {
        throw new Error(result.message ?? ERROR_MESSAGE.NETWORK);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGE.NETWORK);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { setPollutantCatalogActive, isLoading, error };
};
