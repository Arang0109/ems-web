import { useState } from "react";
import { AuthContext, TOKEN_KEY, type AuthCredentials, type AuthUser } from "@entities/auth";

const USER_KEY = "authUser";

const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    // 나중에 추가된 필드(teamId/teamName, userId)는 옛 저장값에 없다. 타입 단언이
    // 거짓말하지 않도록 여기서 null 로 좁힌다 (재로그인하면 실제 값이 채워진다).
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    return {
      ...parsed,
      userId: parsed.userId ?? null,
      teamId: parsed.teamId ?? null,
      teamName: parsed.teamName ?? null,
    } as AuthUser;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = (data: AuthCredentials) => {
    const { accessToken, ...userData } = data;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
  };

  const isAuthenticated = !!accessToken; // accessToken이 null이면 False

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
