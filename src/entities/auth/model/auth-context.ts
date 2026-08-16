import { createContext } from "react";

export interface AuthUser {
  tenant: string;
  username: string;
  name: string;
  /** 소속 팀. 팀 미배정(관리자·플랫폼 운영자 등)이면 null */
  teamId: number | null;
  teamName: string | null;
  role: string;
}

/** 로그인 시 저장하는 값 — 사용자 정보 + 토큰 */
export type AuthCredentials = AuthUser & { accessToken: string };

export interface AuthContextType {
  accessToken: string | null;
  user: AuthUser | null;

  isAuthenticated: boolean;

  login: (data: AuthCredentials) => void;

  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export const TOKEN_KEY = "accessToken";