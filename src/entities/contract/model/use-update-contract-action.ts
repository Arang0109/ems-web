import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { contractApi } from '../api/api';
import { toUpdateRequest } from '../api/mapper';
import type { ContractUpdate } from './types';

export const useUpdateContractAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: ContractUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await contractApi.updateContract(id, payload));
  });

  return { updateContract: run, isLoading, error };
};
