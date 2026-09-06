import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { teamApi } from "../api/api";

export const useDeleteTeamAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await teamApi.deleteTeam(id));
  });

  return { deleteTeam: run, isLoading, error };
};
