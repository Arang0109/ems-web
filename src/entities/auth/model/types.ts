import type { UserListResponse } from "../api/dto";

export type User = UserListResponse

/** 로그인 입력 도메인 모델 (Form → Domain 변환 결과) */
export type SignInCredentials = {
  username: string;
  password: string;
};
