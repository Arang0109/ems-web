import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { memberApi } from "../api/api";
import { memberKeys } from "./query-keys";

export const useDeleteMemberAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await memberApi.deleteMember(id));
  }, { invalidateKeys: [memberKeys.all] });

  return { deleteMember: run, isLoading, error };
};
