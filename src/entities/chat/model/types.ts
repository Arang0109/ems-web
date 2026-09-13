import type { ChatAttachmentResponse, ChatMessageTypeDto } from '../api/dto';

/** 말풍선의 전송 상태. 서버에서 온 메시지는 언제나 `SENT` 다 */
export type ChatDelivery = 'SENT' | 'SENDING' | 'FAILED';

export type ChatMessageType = ChatMessageTypeDto;

export type ChatAttachment = ChatAttachmentResponse;

/** 상대. 삭제된 계정이면 `online` 외 전 필드가 null 이다 */
export type ChatPeer = {
  userId: number | null;
  name: string | null;
  department: string | null;
  online: boolean;
};

export type ChatMessage = {
  /**
   * 서버가 채번한 24자 16진 id. **낙관적 말풍선은 `null` 이다.**
   *
   * 이 `null` 이 읽음 보고의 안전장치다 — 보고 후보를 `messageId != null` 로 좁히면
   * `clientMessageId`(UUID)가 `POST /read` 로 흘러가 400 이 나는 경로가 사라진다.
   */
  messageId: string | null;
  /** 낙관적 말풍선과 서버 메시지를 잇는 키 */
  clientMessageId: string | null;
  roomId: number;
  senderId: number;
  senderName: string | null;
  type: ChatMessageType;
  content: string | null;
  attachment: ChatAttachment | null;
  sentAt: string;
  delivery: ChatDelivery;
  /**
   * 낙관적 첨부의 로컬 미리보기 URL. 전송이 끝나면 `revokeObjectURL` 하고 버린다 —
   * 서버 메시지에는 없는 필드다.
   */
  localPreviewUrl?: string;
};

export type ChatMessagePage = {
  /** 오래된 것 → 새것 순. 응답(최신순)을 뒤집어 화면 순서로 맞춘 것이다 */
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ChatRoom = {
  roomId: number;
  peer: ChatPeer;
  myLastReadMessageId: string | null;
  peerLastReadMessageId: string | null;
};

export type ChatRoomListItem = ChatRoom & {
  lastMessageId: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatContact = {
  userId: number;
  name: string;
  department: string;
  role: string;
  online: boolean;
};

/** 첨부 다운로드 결과 — 엔티티는 DOM 을 만지지 않고 이것만 돌려준다 */
export type ChatAttachmentDownload = {
  blob: Blob;
  filename: string;
};
