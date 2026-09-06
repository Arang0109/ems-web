import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { clientApi } from "../api/api";

export const useDeleteClientAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await clientApi.deleteClient(id));
  });

  return { deleteClient: run, isLoading, error };
};
