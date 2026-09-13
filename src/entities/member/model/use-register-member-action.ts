import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { MemberCreate } from "./types";
import { memberApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import { memberKeys } from "./query-keys";

export const useRegisterMemberAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: MemberCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await memberApi.registerMember(payload));
  }, { invalidateKeys: [memberKeys.all] });

  return { registerMember: run, isLoading, error };
};
