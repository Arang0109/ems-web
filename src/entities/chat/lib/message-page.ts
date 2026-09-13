import type { ChatMessage, ChatMessagePage } from '../model/types';

/**
 * 메시지 페이지 배열을 다루는 순수 변환.
 *
 * **페이지 배열의 방향을 먼저 알아야 한다.** `useInfiniteQuery` 의 `pages` 는 요청 순서대로
 * 쌓이는데, 첫 요청이 최신 50건이고 그다음이 `before` 커서로 받은 더 과거다.
 * 그리고 각 페이지 안쪽은 mapper 가 뒤집어 오래된 것 → 새것 순이다.
 *
 * ```
 * pages[0] = [ ... 최신 묶음 ... ]   ← 이 배열의 끝이 가장 최신 메시지
 * pages[1] = [ ... 그 전 묶음 ... ]
 * pages[2] = [ ... 더 전 묶음 ... ]
 * ```
 *
 * 그래서 **새 메시지는 `pages[0]` 의 끝에 붙는다.**
 */

/** 같은 메시지인지 — 서버 id 를 먼저 보고, 없으면 낙관적 말풍선의 키로 판정한다 */
const isSameMessage = (a: ChatMessage, b: ChatMessage): boolean => {
  if (a.messageId && b.messageId) return a.messageId === b.messageId;
  if (a.clientMessageId && b.clientMessageId) return a.clientMessageId === b.clientMessageId;
  return false;
};

/**
 * 메시지를 페이지 배열에 넣는다 — **이미 있으면 그 자리에서 갈아 끼우고, 없으면 맨 뒤에 붙인다.**
 *
 * 이 "제자리 치환"이 경합을 없앤다. 내가 보낸 메시지는 POST 응답과 STOMP 메아리로 **두 번**
 * 도착하는데 어느 쪽이 먼저 와도 결과가 같아야 하고(멱등), 낙관적 말풍선이 실제 메시지로
 * 바뀔 때 순서가 튀면 안 된다.
 */
export const upsertMessage = (
  pages: ChatMessagePage[],
  message: ChatMessage,
): ChatMessagePage[] => {
  const pageIndex = pages.findIndex((page) => page.messages.some((m) => isSameMessage(m, message)));

  if (pageIndex >= 0) {
    return pages.map((page, i) =>
      i === pageIndex
        ? {
            ...page,
            messages: page.messages.map((m) =>
              isSameMessage(m, message)
                ? // 낙관적 말풍선이 서버 메시지로 바뀌는 순간이다. 로컬 미리보기 URL 은
                  // 호출부가 revoke 해야 하므로 여기서 조용히 흘려보내지 않고 덮어쓴다.
                  { ...m, ...message }
                : m,
            ),
          }
        : page,
    );
  }

  // 페이지가 아직 없으면(첫 메시지) 페이지 하나를 만들어 준다
  if (pages.length === 0) {
    return [{ messages: [message], nextCursor: null, hasMore: false }];
  }

  return pages.map((page, i) =>
    i === 0 ? { ...page, messages: [...page.messages, message] } : page,
  );
};

/**
 * 전송에 실패한 낙관적 말풍선을 표시한다.
 *
 * 스냅샷으로 되돌리지 않는 이유: 사용자가 쓴 내용이 화면에서 사라지면 다시 보낼 대상이
 * 없어진다. 말풍선을 남겨 두고 재시도 버튼을 붙이는 편이 낫다.
 */
export const markMessageFailed = (
  pages: ChatMessagePage[],
  clientMessageId: string,
): ChatMessagePage[] =>
  pages.map((page) => ({
    ...page,
    messages: page.messages.map((m) =>
      m.clientMessageId === clientMessageId && m.delivery === 'SENDING'
        ? { ...m, delivery: 'FAILED' as const }
        : m,
    ),
  }));

/** 재전송 — 실패 말풍선을 그 자리에서 다시 `SENDING` 으로 되돌린다 */
export const markMessageSending = (
  pages: ChatMessagePage[],
  clientMessageId: string,
): ChatMessagePage[] =>
  pages.map((page) => ({
    ...page,
    messages: page.messages.map((m) =>
      m.clientMessageId === clientMessageId && m.delivery === 'FAILED'
        ? { ...m, delivery: 'SENDING' as const }
        : m,
    ),
  }));

/** 특정 낙관적 말풍선을 찾는다 — 재전송할 때 원본 내용을 되살리는 용도 */
export const findMessageByClientId = (
  pages: ChatMessagePage[],
  clientMessageId: string,
): ChatMessage | null => {
  for (const page of pages) {
    const found = page.messages.find((m) => m.clientMessageId === clientMessageId);
    if (found) return found;
  }
  return null;
};
