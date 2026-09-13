import { Client } from "@stomp/stompjs";

import { ACCESS_TOKEN_REFRESHED, refreshAccessToken } from "@shared/api";

import type {
  ChatMessageEvent,
  ChatPresenceEvent,
  ChatReadEvent,
  ChatRoomOpenedEvent,
} from "./dto";

/** 서버 브로커와 맞춘 값. nginx `proxy_read_timeout`(기본 60초) 안에 프레임이 오가야 한다 */
const HEARTBEAT_MS = 25_000;

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

/** 토큰을 새로 받고도 거부당하면 다시 시도해 봐야 같은 결과다 */
const MAX_AUTH_RETRIES = 1;

/** 구독 목적지 — 연결당 한 번씩만 건다. 방별 목적지는 없다 */
const DESTINATION = {
  messages: "/user/queue/chat.messages",
  reads: "/user/queue/chat.reads",
  rooms: "/user/queue/chat.rooms",
  presence: "/user/queue/chat.presence",
} as const;

export interface ChatStreamHandlers {
  onMessage: (event: ChatMessageEvent) => void;
  onRead: (event: ChatReadEvent) => void;
  onRoomOpened: (event: ChatRoomOpenedEvent) => void;
  onPresence: (event: ChatPresenceEvent) => void;
  /**
   * 연결이 (다시) 열렸다. `isReconnect` 면 끊긴 사이의 알림을 놓쳤을 수 있으므로
   * 호출부가 REST 로 메워야 한다 — 서버가 브로드캐스트 실패를 삼키고, `after` 커서가 없어
   * 증분 요청도 못 한다. **조회 결과가 늘 진실의 원천이다.**
   */
  onConnected: (isReconnect: boolean) => void;
}

/** `VITE_WS_URL` 은 dev 에서 절대(`ws://...`), prod 에서 상대(`/ws`)라 형태가 다르다 */
const toBrokerUrl = (): string => {
  const configured = import.meta.env.VITE_WS_URL as string | undefined;
  if (!configured) throw new Error("VITE_WS_URL 이 설정되지 않았습니다.");

  if (!configured.startsWith("/")) return configured;
  return `${location.origin.replace(/^http/, "ws")}${configured}`;
};

const backoffMs = (attempt: number) =>
  Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);

/**
 * 채팅 실시간 수신 — STOMP over WebSocket.
 *
 * **수신 전용이다.** 서버에 `applicationDestinationPrefixes` 가 없어 클라이언트가 보낼
 * 목적지 자체가 존재하지 않는다. 쓰기는 전부 REST 다.
 *
 * `entities/schedule/api/stream.ts`(SSE)와 같은 규약을 따른다 — 매 시도마다 토큰을 다시
 * 읽고, 지수 백오프로 재연결하며, 인증 실패는 재발급 1회까지만 시도한다. 상수를 공유하지
 * 않고 다시 선언한 것은 슬라이스 간 import 를 만들지 않기 위해서다.
 *
 * @returns 구독 해제 함수
 */
export const subscribeChatStream = (handlers: ChatStreamHandlers): (() => void) => {
  let attempt = 0;
  let authRetries = 0;
  let hasConnectedOnce = false;
  let isClosed = false;

  const client = new Client({
    brokerURL: toBrokerUrl(),
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,
    reconnectDelay: RECONNECT_BASE_MS,
    // 콘솔을 프레임 로그로 채우지 않는다
    debug: () => {},
  });

  /**
   * **매 접속 시도마다** 토큰을 새로 읽는다.
   *
   * 생성자에 `connectHeaders` 를 한 번 넣으면 만료된 토큰으로 영원히 재시도하게 된다.
   * 직전 시도가 인증 오류였으면 여기서 재발급을 한 번 받아 본다.
   */
  client.beforeConnect = async () => {
    if (authRetries > 0 && authRetries <= MAX_AUTH_RETRIES) {
      try {
        await refreshAccessToken();
      } catch {
        // 재발급까지 실패하면 세션이 끝난 것이다. 여기서 화면을 옮기지는 않는다 —
        // 그 판단은 axios 인터셉터가 이미 갖고 있고, 소켓 사정으로 작성 중인 폼에서
        // 사용자를 쫓아내면 그게 회귀다. 다음 REST 요청이 로그인 화면으로 데려간다.
        isClosed = true;
      }
    }

    if (isClosed) {
      void client.deactivate();
      return;
    }

    client.connectHeaders = {
      Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
    };
  };

  /** 프레임 하나가 깨져도 구독 전체가 죽지 않게 한다 */
  const parse = <T>(body: string, consume: (event: T) => void) => {
    try {
      consume(JSON.parse(body) as T);
    } catch {
      // 알림을 놓쳐도 조회가 메운다 — 삼키고 넘어간다
    }
  };

  client.onConnect = () => {
    attempt = 0;
    authRetries = 0;
    client.reconnectDelay = RECONNECT_BASE_MS;

    client.subscribe(DESTINATION.messages, (frame) =>
      parse<ChatMessageEvent>(frame.body, handlers.onMessage),
    );
    client.subscribe(DESTINATION.reads, (frame) =>
      parse<ChatReadEvent>(frame.body, handlers.onRead),
    );
    client.subscribe(DESTINATION.rooms, (frame) =>
      parse<ChatRoomOpenedEvent>(frame.body, handlers.onRoomOpened),
    );
    client.subscribe(DESTINATION.presence, (frame) =>
      parse<ChatPresenceEvent>(frame.body, handlers.onPresence),
    );

    handlers.onConnected(hasConnectedOnce);
    hasConnectedOnce = true;
  };

  // ERROR 프레임 = 서버가 CONNECT 를 거절했다. 사유는 구분해 주지 않으므로 만료로 보고
  // 재발급을 한 번 시도한다.
  client.onStompError = () => {
    authRetries += 1;
    if (authRetries > MAX_AUTH_RETRIES) {
      isClosed = true;
      void client.deactivate();
    }
  };

  // stompjs 의 `reconnectDelay` 는 고정값이라 붙지 않는 서버를 1초마다 두드린다.
  // 끊길 때마다 간격을 늘리고 붙으면 되돌린다.
  client.onWebSocketClose = () => {
    if (isClosed) return;
    attempt += 1;
    client.reconnectDelay = backoffMs(attempt);
  };

  // 토큰이 갱신되면 다시 붙는다 — 서버 세션의 신원은 CONNECT 시점에 고정되므로
  // 그대로 두면 만료된 신원으로 계속 붙어 있게 된다.
  const handleTokenRefreshed = () => {
    if (isClosed) return;
    void client.deactivate().then(() => {
      if (!isClosed) client.activate();
    });
  };
  window.addEventListener(ACCESS_TOKEN_REFRESHED, handleTokenRefreshed);

  client.activate();

  return () => {
    isClosed = true;
    window.removeEventListener(ACCESS_TOKEN_REFRESHED, handleTokenRefreshed);
    void client.deactivate();
  };
};
