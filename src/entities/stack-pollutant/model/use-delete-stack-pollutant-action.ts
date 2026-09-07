import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackPollutantApi } from "../api/api";
import { stackPollutantKeys } from "./query-keys";

export const useDeleteStackPollutantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await stackPollutantApi.deleteStackPollutant(id));
  }, { invalidateKeys: [stackPollutantKeys.all] });

  return { deleteStackPollutant: run, isLoading, error };
};
