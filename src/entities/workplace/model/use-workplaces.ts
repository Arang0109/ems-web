import { useLazyFetch } from "@shared/model";

import { workplaceApi } from "../api/api";
import { toWorkplaceListItems } from "../api/mapper";
import type { WorkplaceListItem } from "./types";

/** 타입 B(수동 호출): 의뢰기관을 고르면 그 기관의 사업장 목록을 받아온다. */
export const useWorkplaces = () => {
  const { data, isLoading, error, fetch } = useLazyFetch(
    async (clientId: number | null) => toWorkplaceListItems((await workplaceApi.getWorkplaces(clientId)).data),
    [] as WorkplaceListItem[],
    { resetOnFetch: true },
  );

  return { data, isLoading, error, fetchWorkplaces: fetch };
};
