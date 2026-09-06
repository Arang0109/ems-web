import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { contractApi } from "../api/api";
import type { ContractListItem } from "./types";

/** 타입 A(자동 로드): 계약 목록. */
export const useContracts = () =>
  useFetch<ContractListItem[]>(async () => unwrapMessage(await contractApi.getContracts(null)), []);
