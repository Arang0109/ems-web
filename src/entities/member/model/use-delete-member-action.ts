import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { memberApi } from "../api/api";

export const useDeleteMemberAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await memberApi.deleteMember(id));
  });

  return { deleteMember: run, isLoading, error };
};
