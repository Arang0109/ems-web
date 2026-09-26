import { useEffect, useState } from "react";
import { AuthContext, type AuthCredentials, type AuthUser } from "@entities/auth";
import { SESSION_EXPIRED, tokenStorage } from "@shared/api";

const getStoredUser = (): AuthUser | null => {
  const raw = tokenStorage.getUserRaw();
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
    tokenStorage.getAccessToken()
  );
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = (data: AuthCredentials) => {
    const { accessToken, ...userData } = data;

    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setUserRaw(JSON.stringify(userData));

    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    tokenStorage.clear();
    setAccessToken(null);
    setUser(null);
  };

  // 재발급까지 실패하면 shared(axios)가 저장소를 비우고 알린다 — 로그인 화면으로 새로 시작한다.
  // 전체 새로고침으로 보내는 것은 화면에 남은 쿼리 캐시·구독(STOMP·SSE)을 한 번에 끊기 위해서다.
  useEffect(() => {
    const handleExpired = () => window.location.assign("/");
    window.addEventListener(SESSION_EXPIRED, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, handleExpired);
  }, []);

  const isAuthenticated = !!accessToken; // accessToken이 null이면 False

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
