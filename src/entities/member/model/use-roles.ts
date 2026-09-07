import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { roleApi } from "../api/api";
import { roleKeys } from "./query-keys";
import type { Role } from "./types";

/** 권한 목록. 거의 바뀌지 않는 마스터 데이터라 오래 캐시한다. */
export const useRoles = () =>
  useEntityQuery<Role[]>({
    queryKey: roleKeys.list(),
    queryFn: async () => unwrapMessage(await roleApi.getRoleList()),
    initialData: [],
    staleTime: 5 * 60_000,
  });
