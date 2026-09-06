import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';

export const useDeletePreventionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (preventionId: number) => {
    unwrapMessage(await stackApi.deletePrevention(preventionId));
  });

  return { deletePrevention: run, isLoading, error };
};
