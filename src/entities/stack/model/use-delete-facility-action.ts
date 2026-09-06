import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';

export const useDeleteFacilityAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (facilityId: number) => {
    unwrapMessage(await stackApi.deleteFacility(facilityId));
  });

  return { deleteFacility: run, isLoading, error };
};
