import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { clientApi } from "../api/api";
import { clientKeys } from "./query-keys";
import type { Client } from "./types";

/** 의뢰기관 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useClientDetail = (clientId: number | null) =>
  useEntityQuery<Client | null>({
    queryKey: clientKeys.detail(clientId as number),
    queryFn: async () => unwrapMessage(await clientApi.getClient(clientId as number)),
    initialData: null,
    enabled: clientId != null,
  });
