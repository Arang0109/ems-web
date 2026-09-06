import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { pollutantApi } from '../api/api';

export const useDeletePollutantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await pollutantApi.deletePollutant(id));
  });

  return { deletePollutant: run, isLoading, error };
};
