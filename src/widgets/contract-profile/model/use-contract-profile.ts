import { useContractDetail } from "@entities/contract";

export const useContractProfile = (contractId: string | undefined) => {
  const { data, isLoading, error } = useContractDetail(contractId ? Number(contractId) : null);

  return { contract: data, isLoading, error };
};
