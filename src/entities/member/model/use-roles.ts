import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { roleApi } from "../api/api";
import type { Role } from "./types";

/** 타입 A(자동 로드): 권한 목록. */
export const useRoles = () =>
  useFetch<Role[]>(async () => unwrapMessage(await roleApi.getRoleList()), []);
