import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { StackUpdate } from './types';

export const useUpdateStackAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: StackUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await stackApi.updateStack(id, payload));
  });

  return { updateStack: run, isLoading, error };
};
