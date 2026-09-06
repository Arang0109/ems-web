import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { MemberUpdate } from "./types";
import { memberApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateMemberAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: MemberUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await memberApi.updateMember(id, payload));
  });

  return { updateMember: run, isLoading, error };
};
