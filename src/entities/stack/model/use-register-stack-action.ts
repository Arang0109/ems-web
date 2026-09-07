import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { StackCreate } from './types';
import { stackKeys } from "./query-keys";

export const useRegisterStackAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: StackCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await stackApi.registerStack(payload));
  }, { invalidateKeys: [stackKeys.all] });

  return { registerStack: run, isLoading, error };
};
