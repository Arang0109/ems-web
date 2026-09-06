import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantCatalogApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCatalogCreate } from './types';

export const useRegisterPollutantCatalogAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: PollutantCatalogCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await pollutantCatalogApi.registerPollutantCatalog(payload));
  });

  return { registerPollutantCatalog: run, isLoading, error };
};
