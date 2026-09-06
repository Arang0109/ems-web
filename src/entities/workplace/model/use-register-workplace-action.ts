import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { WorkplaceCreate } from './types';

export const useRegisterWorkplaceAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: WorkplaceCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await workplaceApi.registerWorkplace(payload));
  });

  return { registerWorkplace: run, isLoading, error };
};
