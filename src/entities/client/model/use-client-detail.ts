import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { clientApi } from "../api/api";
import { clientKeys } from "./query-keys";
import type { Client } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 의뢰기관 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useClientDetail = ({ id }: Props) =>
  useEntityQuery<Client | null>({
    queryKey: clientKeys.detail(id as number),
    queryFn: async () => unwrapMessage(await clientApi.getClient(id as number)),
    initialData: null,
    enabled: id != null,
  });
