import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { StackUpdate } from './types';
import { stackKeys } from "./query-keys";

export const useUpdateStackAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: StackUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await stackApi.updateStack(id, payload));
  }, { invalidateKeys: [stackKeys.all] });

  return { updateStack: run, isLoading, error };
};
