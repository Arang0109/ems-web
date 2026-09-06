import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toUpdateFacilityRequest } from '../api/mapper';
import type { FacilityUpdate } from './types';

export const useUpdateFacilityAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (facilityId: number, data: FacilityUpdate) => {
    unwrapMessage(await stackApi.updateFacility(facilityId, toUpdateFacilityRequest(data)));
  });

  return { updateFacility: run, isLoading, error };
};
