import { useEntityMutation } from "@shared/model";
import type { ScheduleDetail, TeamSnapshotUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeTeamRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useChangeTeamAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, team: TeamSnapshotUpdate,): Promise<ScheduleDetail> => {
    const response = await scheduleApi.changeTeam(id, toChangeTeamRequest(team));
    return toScheduleDetail(response.data);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { changeTeam: run, isLoading, error };
};
