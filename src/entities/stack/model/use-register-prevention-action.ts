import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterPreventionRequest } from '../api/mapper';
import type { PreventionCreate } from './types';
import { stackKeys } from "./query-keys";

export const useRegisterPreventionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: PreventionCreate) => {
    unwrapMessage(await stackApi.registerPrevention(toRegisterPreventionRequest(data)));
  }, { invalidateKeys: [stackKeys.all] });

  return { registerPrevention: run, isLoading, error };
};
