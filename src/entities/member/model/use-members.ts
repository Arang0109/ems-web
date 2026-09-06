import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { memberApi } from "../api/api";
import type { Member } from "./types";

/** 타입 A(자동 로드): 구성원 목록. */
export const useMembers = () =>
  useFetch<Member[]>(async () => unwrapMessage(await memberApi.getMemberList()), []);
