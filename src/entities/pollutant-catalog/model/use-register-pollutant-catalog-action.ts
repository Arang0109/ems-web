import { useState } from 'react';

import { pollutantCatalogApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCatalogCreate } from './types';

import { ERROR_MESSAGE } from '@shared/config';

export const useRegisterPollutantCatalogAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerPollutantCatalog = async (data: PollutantCatalogCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await pollutantCatalogApi.registerPollutantCatalog(payload);
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

  return { registerPollutantCatalog, isLoading, error };
};
