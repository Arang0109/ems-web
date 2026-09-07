import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { StackPollutantUpdate } from "./types";
import { stackPollutantApi } from "../api/api";
import { toUpdateStackPollutantRequest } from "../api/mapper";
import { stackPollutantKeys } from "./query-keys";

export const useUpdateStackPollutantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: StackPollutantUpdate) => {
    const payload = toUpdateStackPollutantRequest(data);

    unwrapMessage(await stackPollutantApi.updateStackPollutant(id, payload));
  }, { invalidateKeys: [stackPollutantKeys.all] });

  return { updateStackPollutant: run, isLoading, error };
};
