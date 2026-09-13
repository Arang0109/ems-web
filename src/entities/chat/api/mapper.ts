import type {
  ChatContactResponse,
  ChatMessageEvent,
  ChatMessagePageResponse,
  ChatMessageResponse,
  ChatRoomListResponse,
  ChatRoomResponse,
} from './dto';
import type {
  ChatContact,
  ChatMessage,
  ChatMessagePage,
  ChatRoom,
  ChatRoomListItem,
} from '../model/types';

export const toChatRoom = (dto: ChatRoomResponse): ChatRoom => ({
  roomId: dto.roomId,
  peer: dto.peer,
  myLastReadMessageId: dto.myLastReadMessageId,
  peerLastReadMessageId: dto.peerLastReadMessageId,
});

export const toChatRoomListItem = (dto: ChatRoomListResponse): ChatRoomListItem => ({
  ...toChatRoom(dto),
  lastMessageId: dto.lastMessageId,
  lastMessagePreview: dto.lastMessagePreview,
  lastMessageAt: dto.lastMessageAt,
  unreadCount: dto.unreadCount,
});

/** 서버에서 온 메시지는 이미 전달된 것이므로 `delivery` 를 `SENT` 로 채운다 */
export const toChatMessage = (dto: ChatMessageResponse): ChatMessage => ({
  messageId: dto.messageId,
  clientMessageId: dto.clientMessageId,
  roomId: dto.roomId,
  senderId: dto.senderId,
  senderName: dto.senderName,
  type: dto.type,
  content: dto.content,
  attachment: dto.attachment,
  sentAt: dto.sentAt,
  delivery: 'SENT',
});

/**
 * STOMP 페이로드도 같은 도메인 메시지가 된다 — 필드 순서만 다르고 내용은 REST 응답과 같다.
 * 본문이 통째로 실려 오므로 받고 나서 다시 조회할 필요가 없다.
 */
export const toChatMessageFromEvent = (event: ChatMessageEvent): ChatMessage => ({
  messageId: event.messageId,
  clientMessageId: event.clientMessageId,
  roomId: event.roomId,
  senderId: event.senderId,
  senderName: event.senderName,
  type: event.type,
  content: event.content,
  attachment: event.attachment,
  sentAt: event.sentAt,
  delivery: 'SENT',
});

/**
 * 응답은 **최신순(id DESC)** 이라 여기서 뒤집어 화면 순서(오래된 것 → 새것)로 맞춘다.
 * 순서 뒤집기를 한 곳에 가둬 두면 화면 코드가 정렬을 다시 고민하지 않는다.
 */
export const toChatMessagePage = (dto: ChatMessagePageResponse): ChatMessagePage => ({
  messages: dto.messages.map(toChatMessage).reverse(),
  nextCursor: dto.nextCursor,
  hasMore: dto.hasMore,
});

export const toChatContact = (dto: ChatContactResponse): ChatContact => ({
  userId: dto.userId,
  name: dto.name,
  department: dto.department,
  role: dto.role,
  online: dto.online,
});
