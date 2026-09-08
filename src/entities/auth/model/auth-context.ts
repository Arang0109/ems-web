import { createContext } from "react";

export interface AuthUser {
  /**
   * 사용자 PK — 채팅이 내 메시지를 가려내는 기준이다.
   *
   * `null` 인 경우가 있다: 이 필드가 추가되기 전에 로그인해 둔 사용자의 저장값에는
   * 값이 없다. 그 상태에서도 앱은 정상 동작해야 하므로 채팅만 기능을 낮춘다
   * (소켓을 열지 않고 안읽음 배지를 감춘다).
   */
  userId: number | null;
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