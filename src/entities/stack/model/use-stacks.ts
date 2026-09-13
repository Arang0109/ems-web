import { useEntityQuery } from "@shared/model";

import { stackApi } from "../api/api";
import { toStackListItems } from "../api/mapper";
import { stackKeys } from "./query-keys";
import type { StackListItem } from "./types";

interface Options {
  /**
   * false 면 조회하지 않는다. **`workplaceId: null` 과 혼동하지 말 것** —
   * null 은 "필터 없이 전체", `enabled: false` 는 "아직 고르지 않아 조회할 때가 아님"이다.
   */
  enabled?: boolean;
}

/** 측정시설 목록. `workplaceId` 를 주면 그 사업장의 것만, null 이면 전체를 받는다. */
export const useStacks = (workplaceId: number | null, options?: Options) =>
  useEntityQuery<StackListItem[]>({
    queryKey: stackKeys.list(workplaceId),
    queryFn: async () => toStackListItems((await stackApi.getStacks(workplaceId)).data),
    initialData: [],
    enabled: options?.enabled ?? true,
    invalidateKey: stackKeys.lists(),
  });
