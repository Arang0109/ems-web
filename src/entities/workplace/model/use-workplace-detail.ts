import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { workplaceApi } from "../api/api";
import { workplaceKeys } from "./query-keys";
import type { Workplace } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  workplaceId: number | null;
}

/** 사업장 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useWorkplaceDetail = ({ workplaceId }: Props) =>
  useEntityQuery<Workplace | null>({
    queryKey: workplaceKeys.detail(workplaceId as number),
    queryFn: async () => unwrapMessage(await workplaceApi.getWorkplace(workplaceId as number)),
    initialData: null,
    enabled: workplaceId != null,
  });
