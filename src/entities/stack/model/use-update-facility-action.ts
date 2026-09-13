import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdateFacilityRequest } from '../api/mapper';
import type { FacilityUpdate } from './types';
import { stackKeys } from "./query-keys";

export const useUpdateFacilityAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (facilityId: number, data: FacilityUpdate) => {
    unwrapMessage(await stackApi.updateFacility(facilityId, toUpdateFacilityRequest(data)));
  }, { invalidateKeys: [stackKeys.all] });

  return { updateFacility: run, isLoading, error };
};
