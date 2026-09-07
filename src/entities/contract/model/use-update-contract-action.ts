import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { contractApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { ContractUpdate } from './types';
import { contractKeys } from "./query-keys";

export const useUpdateContractAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: ContractUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await contractApi.updateContract(id, payload));
  }, { invalidateKeys: [contractKeys.all] });

  return { updateContract: run, isLoading, error };
};
