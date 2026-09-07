import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TeamCreate } from "./types";
import { teamApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import { teamKeys } from "./query-keys";

export const useRegisterTeamAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: TeamCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await teamApi.registerTeam(payload));
  }, { invalidateKeys: [teamKeys.all] });

  return { registerTeam: run, isLoading, error };
};
