import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { PollutantCreate } from './types';

export const useRegisterPollutantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: PollutantCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await pollutantApi.registerPollutant(payload));
  });

  return { registerPollutant: run, isLoading, error };
};
