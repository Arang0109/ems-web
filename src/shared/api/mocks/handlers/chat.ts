import { http, HttpResponse } from 'msw';

import { memberList } from './member';

const BASE_URL = 'http://localhost:8080/api';

/**
 * 목 로그인 `admin` 의 사용자 id (`auth.ts` 와 같은 값).
 *
 * 이 값이 어긋나면 화면에서 말풍선 좌우가 통째로 뒤집힌다 — 채팅은 `senderId` 로
 * 내 메시지를 가려내기 때문이다.
 */
const MY_USER_ID = 1;

/** MongoDB ObjectId 흉내 — 24자 16진. 순번 기반이라 사전순 = 시간순이다 */
const toObjectId = (seq: number) => seq.toString(16).padStart(24, '0');

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

type MockMessage = {
  messageId: string;
  roomId: number;
  senderId: number;
  senderName: string | null;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  content: string | null;
  attachment: { filename: string; contentType: string; size: number } | null;
  clientMessageId: string | null;
  sentAt: string;
};

type MockRoom = {
  roomId: number;
  peerUserId: number;
  /** 내가 감춘 방은 목록에서 빠진다 (삭제가 아니다) */
  hidden: boolean;
  myLastReadMessageId: string | null;
  peerLastReadMessageId: string | null;
};

const memberOf = (userId: number) => memberList.find((m) => m.id === userId);

/** 접속 상태 — 목이라 고정값이지만 온·오프가 섞여야 표시를 확인할 수 있다 */
const ONLINE_USER_IDS = new Set([3, 5]);

let rooms: MockRoom[] = [
  { roomId: 1, peerUserId: 3, hidden: false, myLastReadMessageId: null, peerLastReadMessageId: null },
  { roomId: 2, peerUserId: 2, hidden: false, myLastReadMessageId: null, peerLastReadMessageId: null },
  { roomId: 3, peerUserId: 4, hidden: false, myLastReadMessageId: null, peerLastReadMessageId: null },
];

let messageSeq = 0;

/** 커서 페이징을 실제로 밟아 보려면 한 페이지(50)를 넘겨야 한다 */
const seedMessages = (): MockMessage[] => {
  const seeded: MockMessage[] = [];
  const base = new Date(2026, 8, 5, 9, 0, 0);

  const scripts: Record<number, string[]> = {
    1: ['3번 굴뚝 채취 끝났습니다', '기록지 올려두겠습니다', '확인했습니다', '오후에 뵙겠습니다'],
    2: ['분석 결과 언제쯤 나올까요', '내일 오전에 드리겠습니다'],
    3: ['문서 양식 최신본 맞나요', '네 맞습니다'],
  };

  for (const room of rooms) {
    // 1번 방만 넉넉히 채워 역방향 무한 스크롤을 확인할 수 있게 한다
    const count = room.roomId === 1 ? 120 : 6;
    const lines = scripts[room.roomId] ?? ['안녕하세요'];

    for (let i = 0; i < count; i += 1) {
      messageSeq += 1;
      const sentAt = new Date(base.getTime() + (seeded.length + i) * 7 * 60_000);
      seeded.push({
        messageId: toObjectId(messageSeq),
        roomId: room.roomId,
        // 번갈아 주고받아야 좌우 말풍선이 모두 보인다
        senderId: i % 2 === 0 ? room.peerUserId : MY_USER_ID,
        senderName: memberOf(i % 2 === 0 ? room.peerUserId : MY_USER_ID)?.name ?? null,
        type: 'TEXT',
        content: `${lines[i % lines.length]}${count > 10 ? ` (${i + 1})` : ''}`,
        attachment: null,
        clientMessageId: null,
        sentAt: sentAt.toISOString().slice(0, 19),
      });
    }
  }

  return seeded;
};

let messages: MockMessage[] = seedMessages();

/** 첨부 원본 보관 — 목 안에서만 산다(새로고침하면 사라진다) */
const attachmentBlobs = new Map<string, Blob>();

const roomMessages = (roomId: number) =>
  messages.filter((m) => m.roomId === roomId).sort((a, b) => a.messageId.localeCompare(b.messageId));

const lastMessageOf = (roomId: number): MockMessage | null => {
  const list = roomMessages(roomId);
  return list.length > 0 ? list[list.length - 1] : null;
};

const previewOf = (message: MockMessage | null): string | null => {
  if (!message) return null;
  if (message.type === 'IMAGE') return '사진';
  if (message.type === 'FILE') return '파일';
  return message.content?.slice(0, 200) ?? null;
};

const unreadCountOf = (room: MockRoom): number =>
  roomMessages(room.roomId).filter(
    (m) =>
      m.senderId !== MY_USER_ID &&
      (!room.myLastReadMessageId || m.messageId > room.myLastReadMessageId),
  ).length;

const toPeer = (userId: number) => {
  const member = memberOf(userId);
  return {
    userId,
    name: member?.name ?? null,
    department: member?.department ?? null,
    online: ONLINE_USER_IDS.has(userId),
  };
};

const toRoomResponse = (room: MockRoom) => ({
  roomId: room.roomId,
  peer: toPeer(room.peerUserId),
  myLastReadMessageId: room.myLastReadMessageId,
  peerLastReadMessageId: room.peerLastReadMessageId,
});

const toRoomListResponse = (room: MockRoom) => {
  const last = lastMessageOf(room.roomId);
  return {
    ...toRoomResponse(room),
    lastMessageId: last?.messageId ?? null,
    lastMessagePreview: previewOf(last),
    lastMessageAt: last?.sentAt ?? null,
    unreadCount: unreadCountOf(room),
  };
};

const ok = <T,>(data: T, message = '성공') =>
  HttpResponse.json({ status: true, message, data });

const fail = (message: string, status: number) =>
  HttpResponse.json({ status: false, message, data: null }, { status });

const nowStamp = () => new Date().toISOString().slice(0, 19);

export const chatHandlers = [
  // ── 구체 경로를 먼저 등록한다. MSW 는 선언 순서대로 매칭한다 ──────────────

  // 첨부 원본 — ApiResponse 봉투가 없는 바이너리
  http.get(`${BASE_URL}/chat/rooms/:roomId/messages/:messageId/attachment`, ({ params }) => {
    const target = messages.find((m) => m.messageId === params.messageId);
    if (!target) return fail('존재하지 않는 메시지입니다.', 404);
    if (!target.attachment) return fail('첨부 파일이 없는 메시지입니다.', 404);

    const blob = attachmentBlobs.get(target.messageId) ?? new Blob(['mock attachment']);
    const encoded = encodeURIComponent(target.attachment.filename).replace(/\+/g, '%20');

    return new HttpResponse(blob, {
      headers: {
        'Content-Type': target.attachment.contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
      },
    });
  }),

  // 첨부 전송 — multipart. file 이 필수이고 content 는 캡션이다
  http.post(`${BASE_URL}/chat/rooms/:roomId/messages/attachments`, async ({ params, request }) => {
    const roomId = Number(params.roomId);
    if (!rooms.some((r) => r.roomId === roomId)) return fail('존재하지 않는 대화방입니다.', 404);

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail('내용이나 첨부 파일 중 하나는 있어야 합니다.', 400);
    if (file.size > 10 * 1024 * 1024) return fail('첨부 파일은 10MB를 넘을 수 없습니다.', 413);

    messageSeq += 1;
    const created: MockMessage = {
      messageId: toObjectId(messageSeq),
      roomId,
      senderId: MY_USER_ID,
      senderName: memberOf(MY_USER_ID)?.name ?? null,
      // 클라이언트가 정하지 않는다 — contentType 으로 서버가 가른다
      type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
      content: (form.get('content') as string) || null,
      attachment: {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
      },
      clientMessageId: (form.get('clientMessageId') as string) || null,
      sentAt: nowStamp(),
    };

    messages = [...messages, created];
    attachmentBlobs.set(created.messageId, file);

    return ok(created, '메시지 전송 성공');
  }),

  // 메시지 목록 — before 커서 페이징, 최신순
  http.get(`${BASE_URL}/chat/rooms/:roomId/messages`, ({ params, request }) => {
    const roomId = Number(params.roomId);
    if (!rooms.some((r) => r.roomId === roomId)) return fail('존재하지 않는 대화방입니다.', 404);

    const url = new URL(request.url);
    const before = url.searchParams.get('before');
    const size = Math.min(Number(url.searchParams.get('size')) || 50, 100);

    // 최신순으로 뒤집어 커서 이전(더 과거)만 남긴다
    const descending = roomMessages(roomId).reverse();
    const filtered = before ? descending.filter((m) => m.messageId < before) : descending;

    const pageItems = filtered.slice(0, size);
    const hasMore = filtered.length > size;

    return ok(
      {
        messages: pageItems,
        nextCursor: hasMore ? pageItems[pageItems.length - 1].messageId : null,
        hasMore,
      },
      '메시지 조회 성공',
    );
  }),

  // 텍스트 전송
  http.post(`${BASE_URL}/chat/rooms/:roomId/messages`, async ({ params, request }) => {
    const roomId = Number(params.roomId);
    if (!rooms.some((r) => r.roomId === roomId)) return fail('존재하지 않는 대화방입니다.', 404);

    const body = (await request.json()) as { content: string; clientMessageId?: string };
    if (!body.content?.trim()) return fail('내용이나 첨부 파일 중 하나는 있어야 합니다.', 400);

    messageSeq += 1;
    const created: MockMessage = {
      messageId: toObjectId(messageSeq),
      roomId,
      senderId: MY_USER_ID,
      senderName: memberOf(MY_USER_ID)?.name ?? null,
      type: 'TEXT',
      content: body.content,
      attachment: null,
      clientMessageId: body.clientMessageId ?? null,
      sentAt: nowStamp(),
    };

    messages = [...messages, created];
    return ok(created, '메시지 전송 성공');
  }),

  // 읽음 보고 — 형식 검사를 실제로 재현한다
  http.post(`${BASE_URL}/chat/rooms/:roomId/read`, async ({ params, request }) => {
    const roomId = Number(params.roomId);
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return fail('존재하지 않는 대화방입니다.', 404);

    const body = (await request.json()) as { lastReadMessageId: string };

    // clientMessageId(UUID)를 보내는 것이 가장 흔한 실수라 목도 400 을 낸다.
    // 실서버에 붙기 전에 여기서 걸리는 편이 낫다.
    if (!OBJECT_ID_PATTERN.test(body.lastReadMessageId ?? '')) {
      return fail('메시지 id 형식이 올바르지 않습니다.', 400);
    }

    // 커서는 앞으로만 간다 — 역행은 조용히 무시한다
    if (!room.myLastReadMessageId || body.lastReadMessageId > room.myLastReadMessageId) {
      room.myLastReadMessageId = body.lastReadMessageId;
    }

    return ok(null, '읽음 처리 성공');
  }),

  // 대화방 상세
  http.get(`${BASE_URL}/chat/rooms/:roomId`, ({ params }) => {
    const room = rooms.find((r) => r.roomId === Number(params.roomId));
    if (!room) return fail('존재하지 않는 대화방입니다.', 404);
    return ok(toRoomResponse(room), '대화방 조회 성공');
  }),

  // 방 감추기 — 삭제가 아니다
  http.delete(`${BASE_URL}/chat/rooms/:roomId`, ({ params }) => {
    const room = rooms.find((r) => r.roomId === Number(params.roomId));
    if (!room) return fail('존재하지 않는 대화방입니다.', 404);

    room.hidden = true;
    return ok(null, '대화방 나가기 성공');
  }),

  // 대화방 목록 — 최근 대화 순, 감춘 방 제외
  http.get(`${BASE_URL}/chat/rooms`, () => {
    const visible = rooms
      .filter((room) => !room.hidden)
      .map(toRoomListResponse)
      .sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return b.lastMessageAt.localeCompare(a.lastMessageAt);
      });

    return ok(visible, '대화방 목록 조회 성공');
  }),

  // 대화방 개설 — 멱등
  http.post(`${BASE_URL}/chat/rooms`, async ({ request }) => {
    const body = (await request.json()) as { counterpartId: number };

    if (body.counterpartId === MY_USER_ID) return fail('자기 자신과는 대화할 수 없습니다.', 400);
    if (!memberOf(body.counterpartId)) return fail('존재하지 않는 사용자입니다.', 404);

    const existing = rooms.find((r) => r.peerUserId === body.counterpartId);
    if (existing) {
      // 감춰 뒀던 방을 다시 열면 목록에 되돌아온다
      existing.hidden = false;
      return ok(toRoomResponse(existing), '대화방 조회 성공');
    }

    const created: MockRoom = {
      roomId: Math.max(0, ...rooms.map((r) => r.roomId)) + 1,
      peerUserId: body.counterpartId,
      hidden: false,
      myLastReadMessageId: null,
      peerLastReadMessageId: null,
    };
    rooms = [...rooms, created];

    return ok(toRoomResponse(created), '대화방 개설 성공');
  }),

  // 전역 안읽음 — data 가 객체가 아니라 숫자다
  http.get(`${BASE_URL}/chat/unread-count`, () =>
    ok(
      rooms.filter((r) => !r.hidden).reduce((sum, room) => sum + unreadCountOf(room), 0),
      '안읽은 메시지 수 조회 성공',
    ),
  ),

  // 대화 상대 목록 — 회원 목 데이터에서 파생시킨다(따로 적으면 id 가 어긋난다)
  http.get(`${BASE_URL}/chat/contacts`, () =>
    ok(
      memberList
        .filter((m) => m.id !== MY_USER_ID)
        .map((m) => ({
          userId: m.id,
          name: m.name,
          department: m.department,
          role: m.role,
          online: ONLINE_USER_IDS.has(m.id),
        })),
      '대화 상대 목록 조회 성공',
    ),
  ),
];
