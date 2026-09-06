import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { workplaceApi } from "../api/api";
import type { Workplace } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  workplaceId: number | null;
}

/** 타입 A(자동 로드): 사업장 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useWorkplaceDetail = ({ workplaceId }: Props) =>
  useFetch<Workplace | null>(
    async () => unwrapMessage(await workplaceApi.getWorkplace(workplaceId as number)),
    null,
    { deps: [workplaceId], enabled: workplaceId != null, resetOnChange: true },
  );
