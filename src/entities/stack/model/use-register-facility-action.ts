import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterFacilityRequest } from '../api/mapper';
import type { FacilityCreate } from './types';

export const useRegisterFacilityAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: FacilityCreate) => {
    const payload = toRegisterFacilityRequest(data);

    unwrapMessage(await stackApi.registerFacility(payload));
  });

  return { registerFacility: run, isLoading, error };
};
