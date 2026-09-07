import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { WorkplaceCreate } from './types';
import { workplaceKeys } from "./query-keys";

export const useRegisterWorkplaceAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: WorkplaceCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await workplaceApi.registerWorkplace(payload));
  }, { invalidateKeys: [workplaceKeys.all] });

  return { registerWorkplace: run, isLoading, error };
};
