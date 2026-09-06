import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { StackPollutantUpdate } from "./types";
import { stackPollutantApi } from "../api/api";
import { toUpdateStackPollutantRequest } from "../api/mapper";

export const useUpdateStackPollutantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: StackPollutantUpdate) => {
    const payload = toUpdateStackPollutantRequest(data);

    unwrapMessage(await stackPollutantApi.updateStackPollutant(id, payload));
  });

  return { updateStackPollutant: run, isLoading, error };
};
