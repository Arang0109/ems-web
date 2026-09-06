import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { clientApi } from "../api/api";
import type { Client } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 타입 A(자동 로드): 의뢰기관 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useClientDetail = ({ id }: Props) =>
  useFetch<Client | null>(
    async () => unwrapMessage(await clientApi.getClient(id as number)),
    null,
    { deps: [id], enabled: id != null, resetOnChange: true },
  );
