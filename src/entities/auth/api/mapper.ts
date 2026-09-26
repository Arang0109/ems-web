import type { SignInRequest, SignInResponse } from "./dto";
import type { SignInCredentials } from "../model/types";
import type { AuthCredentials } from "../model/auth-context";

export const toSignInRequest = (vo: SignInCredentials): SignInRequest => ({
  username: vo.username,
  password: vo.password,
});

export const toAuthCredentials = (res: SignInResponse): AuthCredentials => ({
  accessToken: res.accessToken,
  userId: res.userId,
  tenant: res.tenant,
  username: res.username,
  name: res.name,
  teamId: res.teamId,
  teamName: res.teamName,
  role: res.role,
});
