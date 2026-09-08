import { describe, expect, it } from 'vitest';

import {
  getLastServerMessageId,
  getMessageKey,
  getReadBoundaryIndex,
  toMessageTimeline,
} from './message-timeline';
import type { ChatMessage, ChatMessagePage } from '../model/types';

const message = (over: Partial<ChatMessage> = {}): ChatMessage => ({
  messageId: null,
  clientMessageId: null,
  roomId: 1,
  senderId: 7,
  senderName: '김철수',
  type: 'TEXT',
  content: '내용',
  attachment: null,
  sentAt: '2026-09-08T14:00:00',
  delivery: 'SENT',
  ...over,
});

const page = (messages: ChatMessage[]): ChatMessagePage => ({
  messages,
  nextCursor: null,
  hasMore: false,
});

const id = (n: number) => String(n).padStart(24, '0');

describe('toMessageTimeline', () => {
  it('과거 페이지가 위로 오도록 역순으로 이어 붙인다', () => {
    // pages[0] = 최신 묶음, pages[1] = 그 전 묶음
    const pages = [page([message({ messageId: id(3) })]), page([message({ messageId: id(1) })])];

    expect(toMessageTimeline(pages).map((m) => m.messageId)).toEqual([id(1), id(3)]);
  });

  it('페이지 간 겹침을 messageId 로 제거한다 — 재연결 리싱크의 필수 조건', () => {
    // 끊긴 사이 새 메시지가 쌓여 0페이지가 밀리면서 1페이지와 겹친 상황
    const pages = [
      page([message({ messageId: id(2) }), message({ messageId: id(3) })]),
      page([message({ messageId: id(1) }), message({ messageId: id(2) })]),
    ];

    expect(toMessageTimeline(pages).map((m) => m.messageId)).toEqual([id(1), id(2), id(3)]);
  });

  it('키가 없는 낙관적 말풍선은 걸러 내지 않는다', () => {
    const pages = [page([message({ clientMessageId: 'c1' }), message({ clientMessageId: 'c2' })])];
    expect(toMessageTimeline(pages)).toHaveLength(2);
  });

  it('빈 페이지 배열은 빈 배열', () => {
    expect(toMessageTimeline([])).toEqual([]);
  });
});

describe('getMessageKey', () => {
  it('clientMessageId 를 우선한다 — 서버 응답으로 바뀌어도 key 가 유지돼야 리마운트되지 않는다', () => {
    const optimistic = message({ clientMessageId: 'c1' });
    const confirmed = message({ clientMessageId: 'c1', messageId: id(1) });

    expect(getMessageKey(optimistic)).toBe(getMessageKey(confirmed));
  });

  it('clientMessageId 가 없으면 messageId 를 쓴다', () => {
    expect(getMessageKey(message({ messageId: id(1) }))).toBe(id(1));
  });
});

describe('getLastServerMessageId', () => {
  it('말단에 전송 중인 말풍선이 있어도 확정된 id 를 집는다', () => {
    const timeline = [
      message({ messageId: id(1) }),
      message({ clientMessageId: 'c1', delivery: 'SENDING' }),
    ];

    expect(getLastServerMessageId(timeline)).toBe(id(1));
  });

  it('확정된 메시지가 하나도 없으면 null — 읽음 보고를 보내지 않는다', () => {
    expect(getLastServerMessageId([message({ clientMessageId: 'c1' })])).toBeNull();
    expect(getLastServerMessageId([])).toBeNull();
  });
});

describe('getReadBoundaryIndex', () => {
  const timeline = [
    message({ messageId: id(1) }),
    message({ messageId: id(2) }),
    message({ messageId: id(3) }),
  ];

  it('커서가 가리키는 위치를 돌려준다', () => {
    expect(getReadBoundaryIndex(timeline, id(2))).toBe(1);
  });

  it('상대가 한 번도 읽지 않았으면 -1', () => {
    expect(getReadBoundaryIndex(timeline, null)).toBe(-1);
  });

  it('커서가 로드된 범위 밖이면 -1', () => {
    expect(getReadBoundaryIndex(timeline, id(9))).toBe(-1);
  });
});
