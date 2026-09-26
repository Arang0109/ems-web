/**
 * 인증 정보 저장소 — `localStorage` 키를 아는 곳은 여기뿐이다.
 *
 * 액세스 토큰은 axios·WebSocket(STOMP)·SSE 스트림이 각자 헤더에 싣고, 로그인 사용자 정보는
 * AuthProvider 가 복원한다. 키 문자열을 곳곳에 적어 두면 하나만 바뀌어도 조용히 로그아웃 상태가 된다.
 */
const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),

  /** `Authorization` 헤더 값. 토큰이 없으면 빈 Bearer — 서버가 401 로 답하게 둔다 */
  authorizationHeader: (): string => `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY) ?? ""}`,

  /** 로그인 사용자 정보(직렬화된 JSON). 해석·보정은 소비자가 한다 */
  getUserRaw: (): string | null => localStorage.getItem(AUTH_USER_KEY),
  setUserRaw: (json: string) => localStorage.setItem(AUTH_USER_KEY, json),

  /** 토큰과 사용자 정보를 함께 지운다 — 토큰만 지우면 다음 로그인 전까지 옛 사용자 정보가 보인다 */
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

/**
 * 재발급까지 실패해 세션이 끝났음을 알리는 전역 이벤트.
 *
 * shared 는 여기까지만 한다 — 로그아웃 상태 반영과 화면 이동은 앱(AuthProvider)이 이 이벤트를 듣고 한다.
 * shared 가 라우트(`/`)를 직접 알면 레이어가 뒤집힌다.
 */
export const SESSION_EXPIRED = "ems:session-expired";
