import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { PollutantUpdate } from './types';
import { pollutantKeys } from "./query-keys";

export const useUpdatePollutantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: PollutantUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await pollutantApi.updatePollutant(id, payload));
  }, { invalidateKeys: [pollutantKeys.all] });

  return { updatePollutant: run, isLoading, error };
};
