import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ClientUpdate } from "./types";
import { clientApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import { clientKeys } from "./query-keys";

export const useUpdateClientAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: ClientUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await clientApi.updateClient(id, payload));
  }, { invalidateKeys: [clientKeys.all] });

  return { updateClient: run, isLoading, error };
};
