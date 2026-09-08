import type { ChatMessage, ChatRoomListItem } from '../model/types';

/** 첨부 메시지의 목록 미리보기 — 서버 `ChatMessage.preview()` 와 같은 문구를 쓴다 */
const toPreview = (message: ChatMessage): string => {
  if (message.type === 'IMAGE') return '사진';
  if (message.type === 'FILE') return '파일';
  return message.content ?? '';
};

/** 최근 대화가 위로. 대화가 없는 방(`lastMessageAt: null`)은 맨 아래 — 서버 정렬과 같다 */
export const sortRoomList = (rooms: ChatRoomListItem[]): ChatRoomListItem[] =>
  [...rooms].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return b.lastMessageAt.localeCompare(a.lastMessageAt);
  });

/**
 * 새 메시지를 대화 목록에 반영한다 — 미리보기·시각을 갈아 끼우고 맨 위로 올린다.
 *
 * @param countsAsUnread 안읽음으로 셀지. 내가 보냈거나 그 방을 보고 있으면 false 다.
 * @returns 해당 방이 목록에 없으면 `null` — 호출부가 목록을 다시 받아야 한다는 신호다
 *          (첫 대화라 목록에 아직 없는 경우이고, 이벤트만으로는 상대 정보를 채울 수 없다).
 */
export const applyMessageToRoomList = (
  rooms: ChatRoomListItem[],
  message: ChatMessage,
  countsAsUnread: boolean,
): ChatRoomListItem[] | null => {
  if (!rooms.some((room) => room.roomId === message.roomId)) return null;

  const next = rooms.map((room) =>
    room.roomId === message.roomId
      ? {
          ...room,
          lastMessageId: message.messageId,
          lastMessagePreview: toPreview(message),
          lastMessageAt: message.sentAt,
          unreadCount: countsAsUnread ? room.unreadCount + 1 : room.unreadCount,
        }
      : room,
  );

  return sortRoomList(next);
};

/**
 * 접속 상태 변화를 반영한다.
 *
 * 이 이벤트는 같은 테넌트 접속자 수만큼 자주 오므로 **무효화가 아니라 이 자리 갱신**이다.
 * 매번 목록을 다시 받으면 사람이 들어오고 나갈 때마다 요청이 난다.
 */
export const applyPresenceToRoomList = (
  rooms: ChatRoomListItem[],
  userId: number,
  online: boolean,
): ChatRoomListItem[] =>
  rooms.map((room) =>
    room.peer.userId === userId ? { ...room, peer: { ...room.peer, online } } : room,
  );

/** 방을 읽음 처리 — 안읽음을 0 으로 내리고 내 커서를 옮긴다 */
export const applyReadToRoomList = (
  rooms: ChatRoomListItem[],
  roomId: number,
  myLastReadMessageId: string,
): ChatRoomListItem[] =>
  rooms.map((room) =>
    room.roomId === roomId ? { ...room, myLastReadMessageId, unreadCount: 0 } : room,
  );

/**
 * 상대가 내 메시지를 읽었다 — **상대 커서만** 옮긴다.
 *
 * `my` 와 `peer` 를 섞지 않으려고 함수를 아예 갈라 두었다. 한 함수에 플래그로 두면
 * 언젠가 반대쪽을 넘기게 되고, 그러면 상대가 읽지도 않은 메시지에 "읽음" 이 붙는다.
 */
export const applyPeerReadToRoomList = (
  rooms: ChatRoomListItem[],
  roomId: number,
  peerLastReadMessageId: string,
): ChatRoomListItem[] =>
  rooms.map((room) => (room.roomId === roomId ? { ...room, peerLastReadMessageId } : room));
