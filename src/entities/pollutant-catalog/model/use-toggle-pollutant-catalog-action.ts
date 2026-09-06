import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantCatalogApi } from '../api/api';

/**
 * 카탈로그 폐지/해제.
 *
 * 삭제 API 가 따로 없는 것은 의도된 설계다 — 이미 그 물질을 등록해 쓰고 있는 고객사와
 * 과거 측정계획 스냅샷이 있으므로, 지우는 대신 선택 목록에서만 감춘다.
 */
export const useTogglePollutantCatalogAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, active: boolean) => {
    unwrapMessage(active
      ? await pollutantCatalogApi.activatePollutantCatalog(id)
      : await pollutantCatalogApi.deactivatePollutantCatalog(id));
  });

  return { setPollutantCatalogActive: run, isLoading, error };
};
