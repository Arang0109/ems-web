import { useEntityMutation } from "@shared/model";

import { signInApi } from "../api/auth-api";
import { toAuthCredentials, toSignInRequest } from "../api/mapper";
import type { AuthCredentials } from "./auth-context";
import type { SignInCredentials } from "./types";

/**
 * 로그인 요청. 성공하면 Context 에 저장할 {@link AuthCredentials} 를 돌려준다.
 * 저장(`login`)·토스트·화면 이동은 feature 훅이 맡는다.
 */
export const useSignInAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (data: SignInCredentials): Promise<AuthCredentials> => {
      const res = await signInApi(toSignInRequest(data));
      return toAuthCredentials(res.data);
    },
  );

  return { signIn: run, isLoading, error };
};
