import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';

export const useDeleteWorkplaceAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await workplaceApi.deleteWorkplace(id));
  });

  return { deleteWorkplace: run, isLoading, error };
};
