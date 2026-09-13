import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { contractApi } from '../api/api';
import { toRegisterRequest } from '../api/mapper';
import type { ContractCreate } from './types';
import { contractKeys } from "./query-keys";

export const useRegisterContractAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: ContractCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await contractApi.registerContract(payload));
  }, { invalidateKeys: [contractKeys.all] });

  return { registerContract: run, isLoading, error };
};
