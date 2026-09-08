export { chatKeys } from './model/query-keys';
export {
  CHAT_ATTACHMENT_MAX_BYTES,
  CHAT_CONTENT_MAX_LENGTH,
  CHAT_PAGE_SIZE,
} from './model/constants';

export type {
  ChatAttachment,
  ChatAttachmentDownload,
  ChatContact,
  ChatDelivery,
  ChatMessage,
  ChatMessagePage,
  ChatMessageType,
  ChatPeer,
  ChatRoom,
  ChatRoomListItem,
} from './model/types';

export { useChatRooms } from './model/use-chat-rooms';
export { useChatRoomDetail } from './model/use-chat-room-detail';
export { useChatContacts } from './model/use-chat-contacts';
export { useChatUnreadCount } from './model/use-chat-unread-count';
export { useChatMessages } from './model/use-chat-messages';
export { useSendChatMessageAction } from './model/use-send-chat-message-action';
export { useChatAttachment } from './model/use-chat-attachment';
export { useDownloadChatAttachmentAction } from './model/use-download-chat-attachment-action';
export type { SendChatMessageInput } from './model/use-send-chat-message-action';

export { useOpenChatRoomAction } from './model/use-open-chat-room-action';
export { useHideChatRoomAction } from './model/use-hide-chat-room-action';
export { useMarkChatRoomReadAction } from './model/use-mark-chat-room-read-action';
export { useChatRealtime } from './model/use-chat-realtime';
export { setActiveChatRoom } from './model/chat-cache';

export { getMessageKey, getReadBoundaryIndex, getLastServerMessageId } from './lib/message-timeline';
