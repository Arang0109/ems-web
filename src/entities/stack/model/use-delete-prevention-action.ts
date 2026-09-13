import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { stackKeys } from "./query-keys";

export const useDeletePreventionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (preventionId: number) => {
    unwrapMessage(await stackApi.deletePrevention(preventionId));
  }, { invalidateKeys: [stackKeys.all] });

  return { deletePrevention: run, isLoading, error };
};
