import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdatePreventionRequest } from '../api/mapper';
import type { PreventionUpdate } from './types';

export const useUpdatePreventionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (preventionId: number, data: PreventionUpdate) => {
    unwrapMessage(await stackApi.updatePrevention( preventionId, toUpdatePreventionRequest(data)));
  });

  return { updatePrevention: run, isLoading, error };
};
