import { useEntityQuery } from "@shared/model";

import { stackPollutantApi } from "../api/api";
import { toStackPollutantListItems } from "../api/mapper";
import { stackPollutantKeys } from "./query-keys";
import type { StackPollutantListItem } from "./types";

interface Options {
  /**
   * false 면 조회하지 않는다. **`stackId: null` 과 혼동하지 말 것** —
   * null 은 "필터 없이 전체", `enabled: false` 는 "아직 고르지 않아 조회할 때가 아님"이다.
   */
  enabled?: boolean;
}

/** 측정시설의 측정항목 원장. `stackId` 를 주면 그 시설의 것만, null 이면 전체를 받는다. */
export const useStackPollutants = (stackId: number | null, options?: Options) =>
  useEntityQuery<StackPollutantListItem[]>({
    queryKey: stackPollutantKeys.list(stackId),
    queryFn: async () =>
      toStackPollutantListItems((await stackPollutantApi.getStackPollutants(stackId)).data),
    initialData: [],
    enabled: options?.enabled ?? true,
    invalidateKey: stackPollutantKeys.lists(),
  });
