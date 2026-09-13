import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { stackKeys } from "./query-keys";

export const useDeleteFacilityAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (facilityId: number) => {
    unwrapMessage(await stackApi.deleteFacility(facilityId));
  }, { invalidateKeys: [stackKeys.all] });

  return { deleteFacility: run, isLoading, error };
};
