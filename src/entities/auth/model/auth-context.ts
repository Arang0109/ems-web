import { createContext } from "react";

export interface AuthUser {
  tenant: string;
  username: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  accessToken: string | null;
  user: AuthUser | null;

  isAuthenticated: boolean;

  login: (data: {
    accessToken: string;
    tenant: string;
    username: string;
    name: string;
    role: string;
  }) => void;

  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export const TOKEN_KEY = "accessToken";