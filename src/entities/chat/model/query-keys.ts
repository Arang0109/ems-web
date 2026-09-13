/**
 * 채팅 쿼리 키.
 *
 * 메시지 하나가 대화 목록·메시지·전역 배지를 **동시에** 바꾸므로 전부 `all` 아래 둔다 —
 * 재연결 후 리싱크에서 `chatKeys.all` 하나로 통째 무효화할 수 있어야 한다.
 */
export const chatKeys = {
  all: ['chat'] as const,

  rooms: () => [...chatKeys.all, 'room'] as const,
  roomList: () => [...chatKeys.rooms(), 'list'] as const,
  roomDetail: (roomId: number) => [...chatKeys.rooms(), 'detail', roomId] as const,

  messages: () => [...chatKeys.all, 'message'] as const,
  messageList: (roomId: number) => [...chatKeys.messages(), roomId] as const,

  unreadCount: () => [...chatKeys.all, 'unread-count'] as const,
  contacts: () => [...chatKeys.all, 'contact'] as const,

  attachments: () => [...chatKeys.all, 'attachment'] as const,
  attachment: (roomId: number, messageId: string) =>
    [...chatKeys.attachments(), roomId, messageId] as const,
};
