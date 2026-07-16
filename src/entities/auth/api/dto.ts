export type SignInRequest = {
  username: string;
  password: string;
}

export type SignInResponse = {
  accessToken: string;
  tenant: string;
  username: string;
  name: string;
  role: string;
}