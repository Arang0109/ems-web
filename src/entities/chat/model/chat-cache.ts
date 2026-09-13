import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { markMessageFailed, markMessageSending, upsertMessage } from "../lib/message-page";
import {
  applyMessageToRoomList,
  applyPeerReadToRoomList,
  applyPresenceToRoomList,
  applyReadToRoomList,
} from "../lib/room-list";
import { chatKeys } from "./query-keys";
import type {
  ChatContact,
  ChatMessage,
  ChatMessagePage,
  ChatRoom,
  ChatRoomListItem,
} from "./types";

/**
 * 채팅 캐시를 직접 만지는 자리 — react-query 의 `setQueryData` 를 한 곳에 모은다.
 *
 * 메시지 목록은 **무효화하지 않는다.** 무효화하면 `InfiniteData` 의 페이지 배열이 통째로
 * 다시 만들어져 스크롤이 튀고, 위로 읽어 올린 과거가 한꺼번에 다시 요청된다. 새 메시지는
 * 본문이 그대로 실려 오므로 재조회할 이유도 없다.
 */

/** `useInfiniteQuery` 가 캐시에 넣는 모양 */
export type ChatMessageInfiniteData = InfiniteData<ChatMessagePage, string | undefined>;

/** 메시지 페이지를 바꿔 넣는다. 캐시가 아직 없으면(방을 연 적 없음) 아무것도 하지 않는다 */
const updateMessagePages = (
  queryClient: QueryClient,
  roomId: number,
  updater: (pages: ChatMessagePage[]) => ChatMessagePage[],
) => {
  queryClient.setQueryData<ChatMessageInfiniteData>(chatKeys.messageList(roomId), (old) =>
    old ? { ...old, pages: updater(old.pages) } : old,
  );
};

/** 메시지를 넣거나 갈아 끼운다 — 낙관적 말풍선, 서버 응답, STOMP 메아리가 모두 이 문을 쓴다 */
export const putMessage = (queryClient: QueryClient, message: ChatMessage) =>
  updateMessagePages(queryClient, message.roomId, (pages) => upsertMessage(pages, message));

export const failMessage = (queryClient: QueryClient, roomId: number, clientMessageId: string) =>
  updateMessagePages(queryClient, roomId, (pages) => markMessageFailed(pages, clientMessageId));

export const retryMessage = (queryClient: QueryClient, roomId: number, clientMessageId: string) =>
  updateMessagePages(queryClient, roomId, (pages) => markMessageSending(pages, clientMessageId));

/** 지금 캐시에 있는 메시지 페이지 — 재전송할 때 원본 내용을 되살리는 용도 */
export const readMessagePages = (
  queryClient: QueryClient,
  roomId: number,
): ChatMessagePage[] =>
  queryClient.getQueryData<ChatMessageInfiniteData>(chatKeys.messageList(roomId))?.pages ?? [];

/** 대화 목록을 바꿔 넣는다. `updater` 가 `null` 을 주면 목록을 다시 받는다 */
export const updateRoomList = (
  queryClient: QueryClient,
  updater: (rooms: ChatRoomListItem[]) => ChatRoomListItem[] | null,
) => {
  const current = queryClient.getQueryData<ChatRoomListItem[]>(chatKeys.roomList());
  if (!current) return;

  const next = updater(current);
  if (next === null) {
    // 목록에 없는 방이라 이벤트만으로는 항목을 조립할 수 없다 — 서버에 다시 묻는다
    void queryClient.invalidateQueries({ queryKey: chatKeys.roomList() });
    return;
  }

  queryClient.setQueryData(chatKeys.roomList(), next);
};

// ─── 지금 보고 있는 대화방 ───────────────────────────────────────────────────

let activeRoomId: number | null = null;

/**
 * 화면에 열려 있는 대화방을 알린다 — 새 메시지를 안읽음으로 셀지 가르는 기준이다.
 *
 * 서버 상태가 아니라 react-query 에 넣지 않고, 방을 바꿀 때마다 앱 트리를 다시 그리게 만드는
 * Context 도 쓰지 않는다. 읽기만 하는 순간 값이라 모듈 변수가 맞다.
 */
export const setActiveChatRoom = (roomId: number | null) => {
  activeRoomId = roomId;
};

/**
 * 그 방을 **실제로 보고 있는지**. 탭이 뒤에 있으면 열려 있어도 보고 있는 것이 아니다 —
 * 그때 온 메시지를 읽은 것으로 치면 배지가 영영 오르지 않는다.
 */
const isWatching = (roomId: number): boolean =>
  activeRoomId === roomId && document.visibilityState === "visible";

// ─── 수신 이벤트 반영 ────────────────────────────────────────────────────────

/**
 * 새 메시지 도착 — 목록·메시지·전역 배지를 한꺼번에 맞춘다.
 *
 * 내가 보낸 메시지도 메아리로 돌아온다. `upsertMessage` 가 `clientMessageId` 로 제자리
 * 치환하므로 POST 응답보다 먼저 와도 결과가 같다.
 */
export const applyIncomingMessage = (
  queryClient: QueryClient,
  message: ChatMessage,
  myUserId: number,
) => {
  putMessage(queryClient, message);

  const isMine = message.senderId === myUserId;
  const countsAsUnread = !isMine && !isWatching(message.roomId);

  updateRoomList(queryClient, (rooms) =>
    applyMessageToRoomList(rooms, message, countsAsUnread),
  );

  if (countsAsUnread) {
    queryClient.setQueryData<number>(chatKeys.unreadCount(), (old) => (old ?? 0) + 1);
  }
};

/** 상대가 내 메시지를 읽었다 — **상대 커서만** 옮긴다 */
export const applyPeerRead = (
  queryClient: QueryClient,
  roomId: number,
  lastReadMessageId: string,
) => {
  queryClient.setQueryData<ChatRoom | null>(chatKeys.roomDetail(roomId), (old) =>
    old ? { ...old, peerLastReadMessageId: lastReadMessageId } : old,
  );
  updateRoomList(queryClient, (rooms) =>
    applyPeerReadToRoomList(rooms, roomId, lastReadMessageId),
  );
};

/**
 * 내가 다른 기기·탭에서 읽었다 — **내 커서**를 옮기고 안읽음을 턴다.
 *
 * 상대 커서를 만지는 함수와 아예 갈라 두었다. 한 함수에 플래그로 두면 언젠가 반대쪽을
 * 넘기게 되고, 그러면 상대가 읽지도 않은 메시지에 "읽음" 이 붙는다.
 */
export const applyMyRead = (
  queryClient: QueryClient,
  roomId: number,
  lastReadMessageId: string,
) => {
  queryClient.setQueryData<ChatRoom | null>(chatKeys.roomDetail(roomId), (old) =>
    old ? { ...old, myLastReadMessageId: lastReadMessageId } : old,
  );
  updateRoomList(queryClient, (rooms) => applyReadToRoomList(rooms, roomId, lastReadMessageId));

  // 전역 배지는 방별 합계라 직접 계산하지 않고 서버에 다시 묻는다
  void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
};

/**
 * 접속 상태 변화 — 목록·상세·연락처의 해당 사용자만 고친다.
 *
 * **무효화하지 않는다.** 같은 테넌트 접속자 수만큼 자주 오는 이벤트라, 무효화하면
 * 사람이 들어오고 나갈 때마다 목록을 다시 받게 된다.
 */
export const applyPresence = (queryClient: QueryClient, userId: number, online: boolean) => {
  updateRoomList(queryClient, (rooms) => applyPresenceToRoomList(rooms, userId, online));

  queryClient.setQueriesData<ChatRoom | null>(
    { queryKey: chatKeys.rooms() },
    (old) =>
      old && old.peer.userId === userId ? { ...old, peer: { ...old.peer, online } } : old,
  );

  queryClient.setQueryData<ChatContact[]>(chatKeys.contacts(), (old) =>
    old?.map((contact) => (contact.userId === userId ? { ...contact, online } : contact)),
  );
};

/** 상대가 나에게 방을 열었다 — 항목을 조립할 정보가 없어 목록을 다시 받는다 */
export const applyRoomOpened = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: chatKeys.roomList() });
};

/**
 * 재연결 직후 — 끊긴 사이의 알림은 유실됐다고 보고 전부 다시 받는다.
 *
 * `InfiniteQuery` 무효화는 저장된 커서로 각 페이지를 다시 요청하므로 커서가 안정적인
 * 이 API 에서는 안전하다. 다만 0페이지가 새 메시지를 품으며 1페이지와 겹치므로,
 * 평탄화할 때 `messageId` 중복 제거가 반드시 있어야 한다(`toMessageTimeline`).
 */
export const resyncChat = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: chatKeys.all });
};
