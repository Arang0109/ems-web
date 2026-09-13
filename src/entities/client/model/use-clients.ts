import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { clientApi } from "../api/api";
import { clientKeys } from "./query-keys";
import type { Client } from "./types";

/** 의뢰기관 목록. */
export const useClients = () =>
  useEntityQuery<Client[]>({
    queryKey: clientKeys.list(),
    queryFn: async () => unwrapMessage(await clientApi.getClientList()),
    initialData: [],
  });
