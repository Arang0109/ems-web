import { formatRelativeTime } from '@shared/lib';
import type { ChatRoomListItem } from '@entities/chat';

import type { ChatRoomListRow } from './types';

/**
 * 상대가 탈퇴하면 서버가 이름·부서를 null 로 준다. 화면에는 빈칸 대신 이유를 적는다 —
 * 빈 줄은 로딩 실패처럼 읽힌다.
 */
const DELETED_PEER_NAME = '알 수 없는 사용자';

export const toChatRoomListRow = (room: ChatRoomListItem): ChatRoomListRow => ({
  roomId: room.roomId,
  peerName: room.peer.name ?? DELETED_PEER_NAME,
  department: room.peer.department ?? '',
  online: room.peer.online,
  preview: room.lastMessagePreview ?? '대화를 시작해 보세요',
  timeLabel: formatRelativeTime(room.lastMessageAt),
  unreadCount: room.unreadCount,
});

/** 이름·부서·미리보기를 훑는 목록 검색 */
export const matchesChatRoomQuery = (row: ChatRoomListRow, query: string): boolean => {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  return [row.peerName, row.department, row.preview].some((field) =>
    field.toLowerCase().includes(keyword),
  );
};
