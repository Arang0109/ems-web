import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterPreventionRequest } from '../api/mapper';
import type { PreventionCreate } from './types';

export const useRegisterPreventionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: PreventionCreate) => {
    unwrapMessage(await stackApi.registerPrevention(toRegisterPreventionRequest(data)));
  });

  return { registerPrevention: run, isLoading, error };
};
