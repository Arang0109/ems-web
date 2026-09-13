import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { clientApi } from "../api/api";
import { clientKeys } from "./query-keys";

export const useDeleteClientAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await clientApi.deleteClient(id));
  }, { invalidateKeys: [clientKeys.all] });

  return { deleteClient: run, isLoading, error };
};
