import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantCatalogApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCatalogCreate } from './types';
import { pollutantCatalogKeys } from "./query-keys";

export const useRegisterPollutantCatalogAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: PollutantCatalogCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await pollutantCatalogApi.registerPollutantCatalog(payload));
  }, { invalidateKeys: [pollutantCatalogKeys.all] });

  return { registerPollutantCatalog: run, isLoading, error };
};
