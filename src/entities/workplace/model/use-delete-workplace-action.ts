import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { workplaceApi } from '../api/api';
import { workplaceKeys } from "./query-keys";

export const useDeleteWorkplaceAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await workplaceApi.deleteWorkplace(id));
  }, { invalidateKeys: [workplaceKeys.all] });

  return { deleteWorkplace: run, isLoading, error };
};
