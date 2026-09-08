import { describe, expect, it } from 'vitest';

import {
  findMessageByClientId,
  markMessageFailed,
  markMessageSending,
  upsertMessage,
} from './message-page';
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

describe('upsertMessage', () => {
  it('새 메시지는 최신 묶음(pages[0])의 끝에 붙는다', () => {
    const pages = [page([message({ messageId: 'a'.repeat(24) })])];
    const added = message({ messageId: 'b'.repeat(24) });

    const next = upsertMessage(pages, added);

    expect(next[0].messages.map((m) => m.messageId)).toEqual(['a'.repeat(24), 'b'.repeat(24)]);
  });

  it('페이지가 아예 없어도 첫 메시지를 받아 낸다', () => {
    const next = upsertMessage([], message({ messageId: 'a'.repeat(24) }));
    expect(next).toHaveLength(1);
    expect(next[0].messages).toHaveLength(1);
  });

  it('같은 messageId 가 다시 오면 늘리지 않고 그 자리를 덮는다', () => {
    const id = 'a'.repeat(24);
    const pages = [page([message({ messageId: id, content: '옛 내용' })])];

    const next = upsertMessage(pages, message({ messageId: id, content: '새 내용' }));

    expect(next[0].messages).toHaveLength(1);
    expect(next[0].messages[0].content).toBe('새 내용');
  });

  it('낙관적 말풍선은 clientMessageId 로 찾아 제자리에서 서버 메시지가 된다', () => {
    const cid = 'client-uuid-1';
    const pages = [
      page([
        message({ messageId: 'a'.repeat(24) }),
        message({ clientMessageId: cid, delivery: 'SENDING' }),
      ]),
    ];

    const next = upsertMessage(
      pages,
      message({ messageId: 'b'.repeat(24), clientMessageId: cid, delivery: 'SENT' }),
    );

    // 순서가 유지되고(뒤로 밀리지 않고) 개수도 그대로다
    expect(next[0].messages).toHaveLength(2);
    expect(next[0].messages[1].messageId).toBe('b'.repeat(24));
    expect(next[0].messages[1].delivery).toBe('SENT');
  });

  it('POST 응답과 STOMP 메아리는 순서가 뒤바뀌어도 결과가 같다 (멱등)', () => {
    const cid = 'client-uuid-1';
    const id = 'b'.repeat(24);
    const optimistic = [page([message({ clientMessageId: cid, delivery: 'SENDING' })])];

    const fromResponse = message({ messageId: id, clientMessageId: cid });
    const fromEcho = message({ messageId: id, clientMessageId: cid });

    const responseFirst = upsertMessage(upsertMessage(optimistic, fromResponse), fromEcho);
    const echoFirst = upsertMessage(upsertMessage(optimistic, fromEcho), fromResponse);

    expect(responseFirst).toEqual(echoFirst);
    expect(responseFirst[0].messages).toHaveLength(1);
  });

  it('과거 페이지에 있는 메시지도 그 페이지에서 갱신한다', () => {
    const id = 'a'.repeat(24);
    const pages = [page([message({ messageId: 'z'.repeat(24) })]), page([message({ messageId: id })])];

    const next = upsertMessage(pages, message({ messageId: id, content: '수정됨' }));

    expect(next[0].messages).toHaveLength(1);
    expect(next[1].messages[0].content).toBe('수정됨');
  });
});

describe('markMessageFailed / markMessageSending', () => {
  it('전송 중이던 말풍선만 실패로 바꾼다 — 이미 도착한 메시지는 건드리지 않는다', () => {
    const cid = 'client-uuid-1';
    const pages = [
      page([
        message({ messageId: 'a'.repeat(24), clientMessageId: cid, delivery: 'SENT' }),
        message({ clientMessageId: 'other', delivery: 'SENDING' }),
      ]),
    ];

    const next = markMessageFailed(pages, cid);

    expect(next[0].messages[0].delivery).toBe('SENT');
    expect(next[0].messages[1].delivery).toBe('SENDING');
  });

  it('재전송하면 실패 말풍선이 그 자리에서 다시 전송 중이 된다', () => {
    const cid = 'client-uuid-1';
    const pages = [page([message({ clientMessageId: cid, delivery: 'FAILED' })])];

    const next = markMessageSending(pages, cid);

    expect(next[0].messages[0].delivery).toBe('SENDING');
    expect(next[0].messages).toHaveLength(1);
  });
});

describe('findMessageByClientId', () => {
  it('여러 페이지를 가로질러 찾는다', () => {
    const pages = [page([message()]), page([message({ clientMessageId: 'cid', content: '원본' })])];
    expect(findMessageByClientId(pages, 'cid')?.content).toBe('원본');
  });

  it('없으면 null', () => {
    expect(findMessageByClientId([page([message()])], 'cid')).toBeNull();
  });
});
