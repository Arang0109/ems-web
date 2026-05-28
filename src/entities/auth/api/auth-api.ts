import type { SignInRequest, SignInResponse } from "@entities/auth";

import { axiosPrivate, axiosPublic } from "@shared/api";
import type { ApiResponseMessage } from "@shared/model";

export const signInApi = async (data: SignInRequest): Promise<ApiResponseMessage<SignInResponse>> => {
  const res = await axiosPublic.post<ApiResponseMessage<SignInResponse>>("/auth/login", data);
  return res.data;
}

export const signOutApi = async ():Promise<ApiResponseMessage<void>> => {
  const res = await axiosPrivate.post("/auth/logout");
  return res.data;
}