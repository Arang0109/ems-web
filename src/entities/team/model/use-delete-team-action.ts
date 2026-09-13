import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { teamApi } from "../api/api";
import { teamKeys } from "./query-keys";

export const useDeleteTeamAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await teamApi.deleteTeam(id));
  }, { invalidateKeys: [teamKeys.all] });

  return { deleteTeam: run, isLoading, error };
};
