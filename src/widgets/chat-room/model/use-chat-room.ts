import { useEffect, useMemo, useState } from "react";

import { useChatMessages, useChatRoomDetail } from "@entities/chat";

import { toChatTimeline } from "./mapper";
import { useChatReadReporter } from "./use-chat-read-reporter";
import { useChatScroll } from "./use-chat-scroll";

interface Props {
  roomId: number;
  myUserId: number;
}

/**
 * 대화방 화면의 데이터와 스크롤을 한데 모은다.
 *
 * 상세(상대 정보·읽음 커서)와 메시지를 따로 받는 이유는 갱신 주기가 다르기 때문이다 —
 * 메시지는 실시간으로 계속 붙고, 상대 정보는 거의 바뀌지 않는다.
 *
 * **호출부는 `key={roomId}` 로 이 훅을 리마운트한다.** 방을 바꾸는 것은 스크롤 위치·
 * 안읽음 기준선·바닥 여부를 전부 되돌리는 일이라, 손으로 초기화 목록을 관리하는 것보다
 * 리마운트가 안전하다(프로젝트의 `key` 리마운트 규약).
 */
export const useChatRoom = ({ roomId, myUserId }: Props) => {
  const { data: room, isLoading: isRoomLoading, error: roomError } = useChatRoomDetail({ roomId });
  const { messages, isLoading, error, hasMore, isLoadingMore, loadMore } = useChatMessages({
    roomId,
  });

  /**
   * "여기부터 안 읽음" 구분선의 기준 — **방에 들어온 순간의** 내 읽음 커서다.
   *
   * 살아 있는 값을 그대로 쓰면 읽음 보고가 나갈 때마다 커서가 말단으로 따라와
   * 구분선이 계속 아래로 미끄러진다. 처음 받은 값을 붙잡아 둔다.
   *
   * `undefined` 는 "아직 못 받았다", `null` 은 "받았는데 커서가 없다"(한 번도 안 읽은 방)로
   * 서로 다른 뜻이다. 상세는 비동기라 첫 렌더에는 값이 없으므로 `useState` 초기값으로는
   * 잡을 수 없고, 도착한 렌더에서 한 번 확정한다.
   */
  const [initialMyLastRead, setInitialMyLastRead] = useState<string | null | undefined>(undefined);
  if (initialMyLastRead === undefined && room) {
    setInitialMyLastRead(room.myLastReadMessageId);
  }

  const timeline = useMemo(
    () =>
      toChatTimeline({
        messages,
        myUserId,
        peerLastReadMessageId: room?.peerLastReadMessageId ?? null,
        initialMyLastReadMessageId: initialMyLastRead ?? null,
      }),
    [messages, myUserId, room?.peerLastReadMessageId, initialMyLastRead],
  );

  const scroll = useChatScroll({
    messageCount: messages.length,
    hasMore,
    isLoadingMore,
    loadMore,
  });

  useChatReadReporter({ roomId, messages, isAtBottom: scroll.isAtBottom });

  const { scrollToBottom } = scroll;
  const lastMessage = messages.at(-1);
  const isMyLastMessage = lastMessage?.senderId === myUserId;
  const lastSentAt = lastMessage?.sentAt;

  // 내가 보낸 메시지는 어디를 보고 있었든 따라 내려간다 — 방금 쓴 것이 화면 밖에
  // 남으면 보냈는지 알 수 없다.
  useEffect(() => {
    if (isMyLastMessage) scrollToBottom();
  }, [isMyLastMessage, lastSentAt, scrollToBottom]);

  return {
    room,
    messages,
    timeline,
    isLoading: isLoading || isRoomLoading,
    error: error ?? roomError,
    isLoadingMore,
    ...scroll,
  };
};
