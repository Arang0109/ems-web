import type { ChatMessage, ChatMessagePage } from '../model/types';

/**
 * 말풍선의 React key.
 *
 * 낙관적 말풍선은 `messageId` 가 없고 서버 메시지는 `clientMessageId` 가 없을 수 있어
 * 둘 중 있는 것을 쓴다. **`clientMessageId` 를 먼저 본다** — 낙관적 말풍선이 서버 응답으로
 * 바뀔 때 key 까지 바뀌면 React 가 리마운트해서 방금 그린 말풍선이 깜빡인다.
 */
export const getMessageKey = (message: ChatMessage): string =>
  message.clientMessageId ?? message.messageId ?? `${message.senderId}-${message.sentAt}`;

/**
 * 페이지 배열을 화면 순서(오래된 것 → 새것)의 한 줄로 편다.
 *
 * `pages` 는 [최신 묶음, 그 전 묶음, …] 순서라 **역순으로** 이어 붙인다.
 *
 * **중복 제거가 필수다.** 재연결 후 리싱크는 저장된 커서로 전 페이지를 다시 받는데,
 * 끊긴 사이 쌓인 메시지 때문에 0페이지가 아래로 밀리면서 1페이지와 겹친다.
 * 서버에 `after` 커서가 없어 증분 요청으로는 피할 수 없는 겹침이다.
 */
export const toMessageTimeline = (pages: ChatMessagePage[]): ChatMessage[] => {
  const seen = new Set<string>();
  const timeline: ChatMessage[] = [];

  // 뒤 페이지(더 과거)부터 앞으로 오면서 쌓는다
  for (let i = pages.length - 1; i >= 0; i -= 1) {
    for (const message of pages[i].messages) {
      const key = message.messageId ?? message.clientMessageId;
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      timeline.push(message);
    }
  }

  return timeline;
};

/**
 * 읽음 보고에 쓸 마지막 메시지 id.
 *
 * **서버가 채번한 id 만 후보다.** `clientMessageId` 를 보내면 400
 * (`CHAT_INVALID_MESSAGE_ID`) 이고, 이것이 서버가 형식 검사를 넣을 만큼 흔한 실수다.
 * 아직 전송 중인 말풍선이 말단에 있어도 그 앞의 확정된 메시지를 집는다.
 */
export const getLastServerMessageId = (timeline: ChatMessage[]): string | null => {
  for (let i = timeline.length - 1; i >= 0; i -= 1) {
    const { messageId } = timeline[i];
    if (messageId) return messageId;
  }
  return null;
};

/**
 * 내 메시지에 "읽음" 을 붙일 경계 인덱스 — 이 값 **이하**인 내 메시지가 읽힌 것이다.
 *
 * ObjectId 문자열 비교로 판정하지 않는다. 사전순이 시간순과 대체로 맞기는 하지만
 * 그건 ObjectId 생성 규칙에 기댄 것이고, 우리가 이미 시간순으로 정렬해 둔 배열의
 * 인덱스를 쓰는 편이 정확하고 읽기도 쉽다.
 *
 * 커서가 로드된 범위보다 과거면(-1) 화면에 보이는 것은 전부 안 읽은 것이다.
 * 커서 자체가 없으면(상대가 한 번도 안 읽음) 역시 -1 이다.
 */
export const getReadBoundaryIndex = (
  timeline: ChatMessage[],
  peerLastReadMessageId: string | null,
): number => {
  if (!peerLastReadMessageId) return -1;
  return timeline.findIndex((m) => m.messageId === peerLastReadMessageId);
};
