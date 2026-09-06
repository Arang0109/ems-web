import { unwrapMessage } from "@shared/api";
import { useLazyFetch } from "@shared/model";

import { contractApi } from "../api/api";
import type { ContractDetail } from "./types";

/** 타입 B(수동 호출): 계약 상세. */
export const useContractDetail = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (contractId: number) => unwrapMessage(await contractApi.getContract(contractId)),
    null as ContractDetail | null,
    { initialLoading: true, resetOnFetch: true, fallbackMessage: "계약 정보를 불러오지 못했습니다." },
  );

  return { data, isLoading, error, fetchContract: fetch };
};
