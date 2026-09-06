import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { teamApi } from "../api/api";
import type { Team } from "./types";

/** 타입 A(자동 로드): 측정팀 목록. */
export const useTeams = () =>
  useFetch<Team[]>(async () => unwrapMessage(await teamApi.getTeamList()), []);
