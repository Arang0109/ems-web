import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ClientCreate } from "./types";
import { clientApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import { clientKeys } from "./query-keys";

export const useRegisterClientAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data:ClientCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await clientApi.registerClient(payload));
  }, { invalidateKeys: [clientKeys.all] });

  return { registerClient: run, isLoading, error };
};
