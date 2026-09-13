import { describe, expect, it } from 'vitest';

import {
  applyMessageToRoomList,
  applyPeerReadToRoomList,
  applyPresenceToRoomList,
  applyReadToRoomList,
  sortRoomList,
} from './room-list';
import type { ChatMessage, ChatRoomListItem } from '../model/types';

const room = (over: Partial<ChatRoomListItem> = {}): ChatRoomListItem => ({
  roomId: 1,
  peer: { userId: 7, name: '김철수', department: '측정1팀', online: false },
  myLastReadMessageId: null,
  peerLastReadMessageId: null,
  lastMessageId: null,
  lastMessagePreview: null,
  lastMessageAt: '2026-09-08T10:00:00',
  unreadCount: 0,
  ...over,
});

const message = (over: Partial<ChatMessage> = {}): ChatMessage => ({
  messageId: 'a'.repeat(24),
  clientMessageId: null,
  roomId: 1,
  senderId: 7,
  senderName: '김철수',
  type: 'TEXT',
  content: '3번 굴뚝 채취 끝났습니다',
  attachment: null,
  sentAt: '2026-09-08T14:00:00',
  delivery: 'SENT',
  ...over,
});

describe('sortRoomList', () => {
  it('최근 대화가 위로 온다', () => {
    const rooms = [
      room({ roomId: 1, lastMessageAt: '2026-09-08T10:00:00' }),
      room({ roomId: 2, lastMessageAt: '2026-09-08T14:00:00' }),
    ];

    expect(sortRoomList(rooms).map((r) => r.roomId)).toEqual([2, 1]);
  });

  it('대화가 없는 방은 맨 아래 — 서버 정렬과 같다', () => {
    const rooms = [
      room({ roomId: 1, lastMessageAt: null }),
      room({ roomId: 2, lastMessageAt: '2026-09-08T10:00:00' }),
    ];

    expect(sortRoomList(rooms).map((r) => r.roomId)).toEqual([2, 1]);
  });

  it('원본 배열을 건드리지 않는다', () => {
    const rooms = [room({ roomId: 1 }), room({ roomId: 2, lastMessageAt: '2026-09-09T10:00:00' })];
    sortRoomList(rooms);
    expect(rooms.map((r) => r.roomId)).toEqual([1, 2]);
  });
});

describe('applyMessageToRoomList', () => {
  it('미리보기·시각을 갱신하고 맨 위로 올린다', () => {
    const rooms = [
      room({ roomId: 2, lastMessageAt: '2026-09-08T13:00:00' }),
      room({ roomId: 1, lastMessageAt: '2026-09-08T10:00:00' }),
    ];

    const next = applyMessageToRoomList(rooms, message(), true);

    expect(next?.[0].roomId).toBe(1);
    expect(next?.[0].lastMessagePreview).toBe('3번 굴뚝 채취 끝났습니다');
    expect(next?.[0].lastMessageAt).toBe('2026-09-08T14:00:00');
  });

  it('첨부는 본문 대신 사진·파일로 적는다 — 서버 미리보기와 같은 문구', () => {
    const rooms = [room()];
    const image = applyMessageToRoomList(rooms, message({ type: 'IMAGE', content: null }), false);
    const file = applyMessageToRoomList(rooms, message({ type: 'FILE', content: null }), false);

    expect(image?.[0].lastMessagePreview).toBe('사진');
    expect(file?.[0].lastMessagePreview).toBe('파일');
  });

  it('안읽음은 셀 때만 늘어난다 — 내가 보냈거나 보고 있는 방이면 그대로', () => {
    const rooms = [room({ unreadCount: 2 })];

    expect(applyMessageToRoomList(rooms, message(), true)?.[0].unreadCount).toBe(3);
    expect(applyMessageToRoomList(rooms, message(), false)?.[0].unreadCount).toBe(2);
  });

  it('목록에 없는 방이면 null — 호출부가 목록을 다시 받아야 한다는 신호', () => {
    expect(applyMessageToRoomList([room({ roomId: 1 })], message({ roomId: 99 }), true)).toBeNull();
  });
});

describe('applyPresenceToRoomList', () => {
  it('해당 상대의 방만 접속 상태를 바꾼다', () => {
    const rooms = [
      room({ roomId: 1, peer: { userId: 7, name: 'A', department: null, online: false } }),
      room({ roomId: 2, peer: { userId: 8, name: 'B', department: null, online: false } }),
    ];

    const next = applyPresenceToRoomList(rooms, 7, true);

    expect(next[0].peer.online).toBe(true);
    expect(next[1].peer.online).toBe(false);
  });
});

describe('읽음 커서는 내 것과 상대 것을 섞지 않는다', () => {
  it('내가 읽으면 내 커서가 움직이고 안읽음이 0 이 된다', () => {
    const rooms = [room({ unreadCount: 5 })];

    const next = applyReadToRoomList(rooms, 1, 'a'.repeat(24));

    expect(next[0].myLastReadMessageId).toBe('a'.repeat(24));
    expect(next[0].unreadCount).toBe(0);
    expect(next[0].peerLastReadMessageId).toBeNull();
  });

  it('상대가 읽으면 상대 커서만 움직인다 — 내 안읽음은 그대로', () => {
    const rooms = [room({ unreadCount: 5 })];

    const next = applyPeerReadToRoomList(rooms, 1, 'a'.repeat(24));

    expect(next[0].peerLastReadMessageId).toBe('a'.repeat(24));
    expect(next[0].myLastReadMessageId).toBeNull();
    expect(next[0].unreadCount).toBe(5);
  });
});
