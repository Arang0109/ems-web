import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TeamUpdate } from "./types";
import { teamApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateTeamAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: TeamUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await teamApi.updateTeam(id, payload));
  });

  return { updateTeam: run, isLoading, error };
};
