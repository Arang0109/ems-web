import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantUpdate } from './types';

export const useUpdatePollutantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: PollutantUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await pollutantApi.updatePollutant(id, payload));
  });

  return { updatePollutant: run, isLoading, error };
};
