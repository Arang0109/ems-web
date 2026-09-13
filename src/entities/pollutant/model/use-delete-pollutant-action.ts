import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';
import { pollutantKeys } from "./query-keys";

export const useDeletePollutantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await pollutantApi.deletePollutant(id));
  }, { invalidateKeys: [pollutantKeys.all] });

  return { deletePollutant: run, isLoading, error };
};
