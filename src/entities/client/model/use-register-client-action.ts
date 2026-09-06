import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ClientCreate } from "./types";
import { clientApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterClientAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data:ClientCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await clientApi.registerClient(payload));
  });

  return { registerClient: run, isLoading, error };
};
