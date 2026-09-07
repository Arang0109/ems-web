import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { contractApi } from "../api/api";
import { contractKeys } from "./query-keys";
import type { ContractListItem } from "./types";

/** 계약 목록. */
export const useContracts = () =>
  useEntityQuery<ContractListItem[]>({
    queryKey: contractKeys.list(),
    queryFn: async () => unwrapMessage(await contractApi.getContracts(null)),
    initialData: [],
  });
