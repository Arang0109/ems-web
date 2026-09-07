import { useEntityQuery } from "@shared/model";

import { stackApi } from "../api/api";
import { toStackDetail } from "../api/mapper";
import { stackKeys } from "./query-keys";
import { getStackDetailDefault } from "./types";
import type { StackDetail } from "./types";

/** 측정시설 상세. 조회 전에는 빈 상세로 화면이 성립한다. */
export const useStackDetail = (stackId: number | null) =>
  useEntityQuery<StackDetail>({
    queryKey: stackKeys.detail(stackId as number),
    queryFn: async () => toStackDetail((await stackApi.getStack(stackId as number)).data),
    initialData: getStackDetailDefault(),
    enabled: stackId != null,
  });
