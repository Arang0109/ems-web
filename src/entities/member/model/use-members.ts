import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { memberApi } from "../api/api";
import { memberKeys } from "./query-keys";
import type { Member } from "./types";

/** 구성원 목록. */
export const useMembers = () =>
  useEntityQuery<Member[]>({
    queryKey: memberKeys.list(),
    queryFn: async () => unwrapMessage(await memberApi.getMemberList()),
    initialData: [],
  });
