import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantCatalogApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantCatalogUpdate } from './types';
import { pollutantCatalogKeys } from "./query-keys";

export const useUpdatePollutantCatalogAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: PollutantCatalogUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await pollutantCatalogApi.updatePollutantCatalog(id, payload));
  }, { invalidateKeys: [pollutantCatalogKeys.all] });

  return { updatePollutantCatalog: run, isLoading, error };
};
