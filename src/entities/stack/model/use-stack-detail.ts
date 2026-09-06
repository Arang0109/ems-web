import { useLazyFetch } from "@shared/model";

import { stackApi } from "../api/api";
import { toStackDetail } from "../api/mapper";
import { getStackDetailDefault } from "./types";

/** 타입 B(수동 호출): 측정시설 상세. 조회 전에는 빈 상세로 화면이 성립한다. */
export const useStackDetail = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (stackId: number) => toStackDetail((await stackApi.getStack(stackId)).data),
    getStackDetailDefault(),
    { initialLoading: true, resetOnFetch: true },
  );

  return { data, isLoading, error, fetchStack: fetch };
};
