import { useEntityQuery } from "@shared/model";

import { workplaceApi } from "../api/api";
import { toWorkplaceListItems } from "../api/mapper";
import { workplaceKeys } from "./query-keys";
import type { WorkplaceListItem } from "./types";

interface Options {
  /**
   * false 면 조회하지 않는다. **`clientId: null` 과 혼동하지 말 것** —
   * null 은 "필터 없이 전체", `enabled: false` 는 "아직 고르지 않아 조회할 때가 아님"이다.
   */
  enabled?: boolean;
}

/** 사업장 목록. `clientId` 를 주면 그 의뢰기관의 것만, null 이면 전체를 받는다. */
export const useWorkplaces = (clientId: number | null, options?: Options) =>
  useEntityQuery<WorkplaceListItem[]>({
    queryKey: workplaceKeys.list(clientId),
    queryFn: async () => toWorkplaceListItems((await workplaceApi.getWorkplaces(clientId)).data),
    initialData: [],
    enabled: options?.enabled ?? true,
    invalidateKey: workplaceKeys.lists(),
  });
