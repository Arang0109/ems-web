import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantCatalogApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantCatalogUpdate } from './types';

export const useUpdatePollutantCatalogAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: PollutantCatalogUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await pollutantCatalogApi.updatePollutantCatalog(id, payload));
  });

  return { updatePollutantCatalog: run, isLoading, error };
};
