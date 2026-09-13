import type { UserListResponse } from "./dto";

import { axiosPrivate } from "@shared/api";
import type { ApiResponseMessage } from "@shared/model";

export const userApi = {
  getUserList: async (): Promise<ApiResponseMessage<UserListResponse[]>> => {
  const res = await axiosPrivate.get<ApiResponseMessage<UserListResponse[]>>("/users");
  return res.data;
  },
}