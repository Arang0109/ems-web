import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TeamCreate } from "./types";
import { teamApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterTeamAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: TeamCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await teamApi.registerTeam(payload));
  });

  return { registerTeam: run, isLoading, error };
};
