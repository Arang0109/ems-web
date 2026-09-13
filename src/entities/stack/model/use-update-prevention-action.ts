import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdatePreventionRequest } from '../api/mapper';
import type { PreventionUpdate } from './types';
import { stackKeys } from "./query-keys";

export const useUpdatePreventionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (preventionId: number, data: PreventionUpdate) => {
    unwrapMessage(await stackApi.updatePrevention( preventionId, toUpdatePreventionRequest(data)));
  }, { invalidateKeys: [stackKeys.all] });

  return { updatePrevention: run, isLoading, error };
};
