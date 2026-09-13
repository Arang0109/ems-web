import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { MemberUpdate } from "./types";
import { memberApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import { memberKeys } from "./query-keys";

export const useUpdateMemberAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: MemberUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await memberApi.updateMember(id, payload));
  }, { invalidateKeys: [memberKeys.all] });

  return { updateMember: run, isLoading, error };
};
