import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { WorkplaceUpdate } from './types';

export const useUpdateWorkplaceAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: WorkplaceUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await workplaceApi.updateWorkplace(id, payload));
  });

  return { updateWorkplace: run, isLoading, error };
};
