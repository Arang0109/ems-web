import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { teamApi } from "../api/api";
import { teamKeys } from "./query-keys";
import type { Team } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 측정팀 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useTeamDetail = ({ id }: Props) =>
  useEntityQuery<Team | null>({
    queryKey: teamKeys.detail(id as number),
    queryFn: async () => unwrapMessage(await teamApi.getTeam(id as number)),
    initialData: null,
    enabled: id != null,
  });
