import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { WorkplaceUpdate } from './types';
import { workplaceKeys } from "./query-keys";

export const useUpdateWorkplaceAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: WorkplaceUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await workplaceApi.updateWorkplace(id, payload));
  }, { invalidateKeys: [workplaceKeys.all] });

  return { updateWorkplace: run, isLoading, error };
};
