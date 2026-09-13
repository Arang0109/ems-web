export type SignInRequest = {
  username: string;
  password: string;
}

export type SignInResponse = {
  /**
   * 사용자 PK. 채팅의 `senderId`·`readerId` 가 숫자라 이 값이 없으면 내 말풍선과
   * 상대 말풍선을 구분할 수 없다. `username`(문자열)으로 대신할 수 없고
   * 액세스 토큰 claim 에도 없다.
   */
  userId: number;
  accessToken: string;
  tenant: string;
  username: string;
  name: string;
  /** 소속 팀. 팀 미배정은 정상 상태이므로 서버가 null 을 내려준다 */
  teamId: number | null;
  teamName: string | null;
  role: string;
}

export type UserListResponse = {
  userId: number;
  name: string;
  department: string;
  role: string;
}