import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { memberApi } from "../api/api";
import { memberKeys } from "./query-keys";
import type { Member } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 구성원 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useMemberDetail = ({ id }: Props) =>
  useEntityQuery<Member | null>({
    queryKey: memberKeys.detail(id as number),
    queryFn: async () => unwrapMessage(await memberApi.getMember(id as number)),
    initialData: null,
    enabled: id != null,
  });
