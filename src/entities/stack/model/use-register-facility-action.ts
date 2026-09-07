import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';
import { toRegisterFacilityRequest } from '../api/mapper';
import type { FacilityCreate } from './types';
import { stackKeys } from "./query-keys";

export const useRegisterFacilityAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: FacilityCreate) => {
    const payload = toRegisterFacilityRequest(data);

    unwrapMessage(await stackApi.registerFacility(payload));
  }, { invalidateKeys: [stackKeys.all] });

  return { registerFacility: run, isLoading, error };
};
