/**
 * 채팅 요청·응답 DTO — 서버 계약(`ems-server` `docs/chat-websocket-protocol.md`)과 1:1 이다.
 *
 * 날짜는 전부 서버 `LocalDateTime` 의 직렬화 형태(`'2026-09-08T14:03:11'`)로, 오프셋이 없다.
 */

// ─── 요청 ────────────────────────────────────────────────────────────────────

export type OpenDirectRoomRequest = {
  counterpartId: number;
};

export type SendMessageRequest = {
  content: string;
  /** 낙관적 말풍선을 잇는 키. 서버는 해석하지 않고 응답·브로드캐스트에 그대로 돌려준다 */
  clientMessageId?: string;
};

export type MarkAsReadRequest = {
  /**
   * 서버가 채번한 24자 16진 메시지 id.
   *
   * `clientMessageId`(UUID)를 보내면 400 이다 — 서버가 형식을 검사한다.
   */
  lastReadMessageId: string;
};

// ─── 응답 ────────────────────────────────────────────────────────────────────

/** 상대가 삭제된 계정이면 `online` 을 뺀 전 필드가 null 로 온다 */
export type ChatRoomPeerResponse = {
  userId: number | null;
  name: string | null;
  department: string | null;
  online: boolean;
};

export type ChatRoomResponse = {
  roomId: number;
  peer: ChatRoomPeerResponse;
  /** **요청자**의 읽음 커서 — 방에 들어갈 때 어디부터 보여줄지 */
  myLastReadMessageId: string | null;
  /** **상대**의 읽음 커서 — 이 id 이하인 내 메시지에 "읽음"을 붙인다 */
  peerLastReadMessageId: string | null;
};

export type ChatRoomListResponse = ChatRoomResponse & {
  lastMessageId: string | null;
  /** 서버가 200자로 자른 미리보기. 첨부는 `'사진'`·`'파일'` 로 온다 */
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatAttachmentResponse = {
  filename: string;
  contentType: string;
  size: number;
};

export type ChatMessageTypeDto = 'TEXT' | 'IMAGE' | 'FILE';

export type ChatMessageResponse = {
  /** MongoDB ObjectId — 24자 16진 */
  messageId: string;
  roomId: number;
  senderId: number;
  senderName: string | null;
  /** 클라이언트가 정하지 않는다 — 서버가 `contentType` 으로 IMAGE/FILE 을 가른다 */
  type: ChatMessageTypeDto;
  content: string | null;
  attachment: ChatAttachmentResponse | null;
  clientMessageId: string | null;
  sentAt: string;
};

export type ChatMessagePageResponse = {
  /** **최신순(id DESC)** 이다 — 화면에 그리려면 뒤집어야 한다 */
  messages: ChatMessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ChatContactResponse = {
  userId: number;
  name: string;
  department: string;
  role: string;
  online: boolean;
};

// ─── STOMP 이벤트 페이로드 ───────────────────────────────────────────────────
//
// **`ApiResponse` 봉투가 없다** — 프레임 본문이 곧 이벤트 객체다.

/** `/user/queue/chat.messages` — 내가 보낸 것도 메아리로 돌아온다 */
export type ChatMessageEvent = {
  roomId: number;
  messageId: string;
  senderId: number;
  senderName: string | null;
  type: ChatMessageTypeDto;
  content: string | null;
  attachment: ChatAttachmentResponse | null;
  clientMessageId: string | null;
  sentAt: string;
};

/** `/user/queue/chat.reads` */
export type ChatReadEvent = {
  roomId: number;
  readerId: number;
  lastReadMessageId: string;
  readAt: string;
};

/** `/user/queue/chat.rooms` — 상대가 나에게 대화방을 열었다 */
export type ChatRoomOpenedEvent = {
  roomId: number;
  peerUserId: number;
  peerName: string | null;
  peerDepartment: string | null;
};

/** `/user/queue/chat.presence` */
export type ChatPresenceEvent = {
  userId: number;
  status: 'ONLINE' | 'OFFLINE';
  changedAt: string;
};
