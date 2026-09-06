import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { StackCreate } from './types';

export const useRegisterStackAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: StackCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await stackApi.registerStack(payload));
  });

  return { registerStack: run, isLoading, error };
};
