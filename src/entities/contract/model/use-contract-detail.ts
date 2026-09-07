import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { contractApi } from "../api/api";
import { contractKeys } from "./query-keys";
import type { ContractDetail } from "./types";

/** 계약 상세. `contractId` 가 null 이면 조회하지 않는다. */
export const useContractDetail = (contractId: number | null) =>
  useEntityQuery<ContractDetail | null>({
    queryKey: contractKeys.detail(contractId as number),
    queryFn: async () => unwrapMessage(await contractApi.getContract(contractId as number)),
    initialData: null,
    enabled: contractId != null,
    fallbackMessage: "계약 정보를 불러오지 못했습니다.",
  });
