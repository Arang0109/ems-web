export type SignInRequest = {
  username: string;
  password: string;
}

export type SignInResponse = {
  accessToken: string;
  tenant: string;
  username: string;
  name: string;
  /** 소속 팀. 팀 미배정은 정상 상태이므로 서버가 null 을 내려준다 */
  teamId: number | null;
  teamName: string | null;
  role: string;
}