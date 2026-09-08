import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { toChatMessageFromEvent } from "../api/mapper";
import { subscribeChatStream } from "../api/stomp-client";
import {
  applyIncomingMessage,
  applyMyRead,
  applyPeerRead,
  applyPresence,
  applyRoomOpened,
  resyncChat,
} from "./chat-cache";

interface Props {
  /** 내 사용자 id. `null` 이면 연결하지 않는다 — 메아리를 가려낼 수 없다 */
  myUserId: number | null;
  /** 로그인 상태. 꺼지면 연결을 닫는다 */
  isEnabled: boolean;
}

/**
 * 채팅 실시간 수신을 앱에 하나만 연다.
 *
 * **이벤트를 Context 로 흘려보내지 않는다.** 소비자(대화 목록·대화방·사이드바 배지)가
 * 서로 다른 트리에 있지만 전부 react-query 캐시를 읽으므로, 여기서 캐시에 쓰고 나머지는
 * 평소처럼 캐시를 구독하면 된다. Context 로 뿌리면 소비처마다 구독을 배선해야 하고
 * 같은 이벤트가 두 곳에서 다르게 해석될 여지가 생긴다.
 *
 * 로그아웃 배선은 따로 없다 — `isEnabled` 가 꺼지면서 effect 정리가 소켓을 닫는다.
 */
export const useChatRealtime = ({ myUserId, isEnabled }: Props) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isEnabled || myUserId === null) return;

    return subscribeChatStream({
      onMessage: (event) =>
        applyIncomingMessage(queryClient, toChatMessageFromEvent(event), myUserId),

      // 같은 이벤트라도 누가 읽었느냐에 따라 만질 커서가 다르다.
      // 내가 읽은 것은 다른 기기·탭에서 읽은 경우다.
      onRead: (event) =>
        event.readerId === myUserId
          ? applyMyRead(queryClient, event.roomId, event.lastReadMessageId)
          : applyPeerRead(queryClient, event.roomId, event.lastReadMessageId),

      onRoomOpened: () => applyRoomOpened(queryClient),

      onPresence: (event) =>
        applyPresence(queryClient, event.userId, event.status === "ONLINE"),

      onConnected: (isReconnect) => {
        // 끊겨 있던 동안의 알림은 유실됐다고 본다 — 조회가 진실의 원천이다
        if (isReconnect) resyncChat(queryClient);
      },
    });
  }, [isEnabled, myUserId, queryClient]);
};
