import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCreate } from './types';
import { pollutantKeys } from "./query-keys";

export const useRegisterPollutantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: PollutantCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await pollutantApi.registerPollutant(payload));
  }, { invalidateKeys: [pollutantKeys.all] });

  return { registerPollutant: run, isLoading, error };
};
