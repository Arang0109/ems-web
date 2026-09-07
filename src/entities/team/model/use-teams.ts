import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { teamApi } from "../api/api";
import { teamKeys } from "./query-keys";
import type { Team } from "./types";

/** 측정팀 목록. */
export const useTeams = () =>
  useEntityQuery<Team[]>({
    queryKey: teamKeys.list(),
    queryFn: async () => unwrapMessage(await teamApi.getTeamList()),
    initialData: [],
  });
