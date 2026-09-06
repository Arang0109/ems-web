import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackPollutantApi } from "../api/api";

export const useDeleteStackPollutantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await stackPollutantApi.deleteStackPollutant(id));
  });

  return { deleteStackPollutant: run, isLoading, error };
};
