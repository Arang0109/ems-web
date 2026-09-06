import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ClientUpdate } from "./types";
import { clientApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateClientAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: ClientUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await clientApi.updateClient(id, payload));
  });

  return { updateClient: run, isLoading, error };
};
