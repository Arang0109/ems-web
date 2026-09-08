import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { userApi } from "../api/user-api";
import { userKeys } from "./query-keys";
import type { User } from "./types";

/** 사용자 목록. */
export const useUsers = () =>
  useEntityQuery<User[]>({
    queryKey: userKeys.list(),
    queryFn: async () => unwrapMessage(await userApi.getUserList()),
    initialData: [],
  });