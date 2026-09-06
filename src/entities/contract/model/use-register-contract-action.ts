import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { contractApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { ContractCreate } from './types';

export const useRegisterContractAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: ContractCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await contractApi.registerContract(payload));
  });

  return { registerContract: run, isLoading, error };
};
