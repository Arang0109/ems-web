import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { clientApi } from "../api/api";
import type { Client } from "./types";

/** 타입 A(자동 로드): 의뢰기관 목록. */
export const useClients = () =>
  useFetch<Client[]>(async () => unwrapMessage(await clientApi.getClientList()), []);
