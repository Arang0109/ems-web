export type SignInRequest = {
  username: string;
  password: string;
}

export type SignInResponse = {
  accessToken: string;
  username: string;
}