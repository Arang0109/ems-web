import { useLazyFetch } from "@shared/model";

import { stackApi } from "../api/api";
import { toStackListItems } from "../api/mapper";
import type { StackListItem } from "./types";

/** 타입 B(수동 호출): 사업장을 고르면 그 사업장의 측정시설 목록을 받아온다. */
export const useStacks = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (workplaceId: number | null) => toStackListItems((await stackApi.getStacks(workplaceId)).data),
    [] as StackListItem[],
    { resetOnFetch: true },
  );

  return { data, isLoading, error, fetchStacks: fetch };
};
