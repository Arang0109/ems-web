import { formatClockTime, formatDate, formatDayLabel } from "@shared/lib";
import { getMessageKey, getReadBoundaryIndex, type ChatMessage } from "@entities/chat";

import type { ChatTimelineEntry } from "./types";

/** 같은 사람이 같은 분에 보냈는지 — 말풍선을 한 묶음으로 볼 기준 */
const isSameBurst = (a: ChatMessage | undefined, b: ChatMessage): boolean => {
  if (!a) return false;
  if (a.senderId !== b.senderId) return false;
  // 'yyyy-MM-ddTHH:mm' 까지만 비교한다 (초는 무시)
  return a.sentAt.slice(0, 16) === b.sentAt.slice(0, 16);
};

interface Options {
  messages: ChatMessage[];
  myUserId: number;
  /** 상대의 읽음 커서 — 이 위치 이하인 **내** 메시지에 "읽음" 이 붙는다 */
  peerLastReadMessageId: string | null;
  /**
   * 내 읽음 커서 — 이 다음 줄에 "여기부터 안 읽음" 구분선을 넣는다.
   *
   * 방에 **처음 들어온 시점의 값**을 넘겨야 한다. 읽음 보고가 나가면 커서가 말단으로
   * 움직이는데 그때마다 구분선이 따라 내려오면 방금 읽은 자리가 계속 표시된다.
   */
  initialMyLastReadMessageId: string | null;
}

/**
 * 메시지 배열을 화면 항목으로 편다 — 일자 구분선과 안읽음 구분선을 끼워 넣고,
 * 시각·읽음 표시·묶음 여부를 미리 계산한다.
 */
export const toChatTimeline = ({
  messages,
  myUserId,
  peerLastReadMessageId,
  initialMyLastReadMessageId,
}: Options): ChatTimelineEntry[] => {
  const readBoundary = getReadBoundaryIndex(messages, peerLastReadMessageId);

  // 안읽음 구분선은 커서 **다음** 줄에 온다. 커서가 없으면(한 번도 안 읽은 방)
  // 첫 줄 앞이지만, 그때는 대화 전체가 안 읽은 것이라 구분선이 의미 없어 넣지 않는다.
  const unreadAfterIndex = initialMyLastReadMessageId
    ? messages.findIndex((m) => m.messageId === initialMyLastReadMessageId)
    : -1;
  // 커서가 말단이면 안 읽은 메시지가 없다
  const hasUnreadDivider = unreadAfterIndex >= 0 && unreadAfterIndex < messages.length - 1;

  const entries: ChatTimelineEntry[] = [];
  let lastDayKey = "";

  messages.forEach((message, index) => {
    const dayKey = formatDate(message.sentAt);
    if (dayKey && dayKey !== lastDayKey) {
      entries.push({ kind: "day", key: `day-${dayKey}`, label: formatDayLabel(message.sentAt) });
      lastDayKey = dayKey;
    }

    if (hasUnreadDivider && index === unreadAfterIndex + 1) {
      entries.push({ kind: "unread-divider", key: "unread-divider" });
    }

    const isMine = message.senderId === myUserId;
    const previous = messages[index - 1];
    const next = messages[index + 1];

    entries.push({
      kind: "message",
      key: getMessageKey(message),
      message,
      isMine,
      timeLabel: formatClockTime(message.sentAt),
      // 아직 서버에 닿지 않은 말풍선은 읽혔을 수 없다
      isRead: isMine && message.messageId !== null && readBoundary >= index,
      showTime: !isSameBurst(next, message),
      isGroupStart: !isSameBurst(previous, message),
    });
  });

  return entries;
};
