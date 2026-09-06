import { useLazyFetch } from "@shared/model";

import { stackPollutantApi } from "../api/api";
import { toStackPollutantListItems } from "../api/mapper";
import type { StackPollutantListItem } from "./types";

/** 타입 B(수동 호출): 측정시설을 고르면 그 시설의 측정항목 원장을 받아온다. */
export const useStackPollutants = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (stackId: number | null) =>
      toStackPollutantListItems((await stackPollutantApi.getStackPollutants(stackId)).data),
    [] as StackPollutantListItem[],
    { initialLoading: true, resetOnFetch: true },
  );

  return { data, isLoading, error, fetchStackPollutants: fetch };
};
