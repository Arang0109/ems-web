import { useState } from 'react';

import { pollutantCatalogApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantCatalogUpdate } from './types';

import { ERROR_MESSAGE } from '@shared/config';

export const useUpdatePollutantCatalogAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePollutantCatalog = async (id: number, data: PollutantCatalogUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await pollutantCatalogApi.updatePollutantCatalog(id, payload);
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

  return { updatePollutantCatalog, isLoading, error };
};
