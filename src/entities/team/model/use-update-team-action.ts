import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TeamUpdate } from "./types";
import { teamApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import { teamKeys } from "./query-keys";

export const useUpdateTeamAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: TeamUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await teamApi.updateTeam(id, payload));
  }, { invalidateKeys: [teamKeys.all] });

  return { updateTeam: run, isLoading, error };
};
