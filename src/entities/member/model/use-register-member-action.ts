import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { MemberCreate } from "./types";
import { memberApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterMemberAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: MemberCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await memberApi.registerMember(payload));
  });

  return { registerMember: run, isLoading, error };
};
