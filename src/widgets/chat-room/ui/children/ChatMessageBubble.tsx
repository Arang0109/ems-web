import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@entities/chat";
import { IconButton } from "@shared/ui/buttons";

import type { ChatTimelineEntry } from "../../model/types";
import { ChatFileAttachment } from "./ChatFileAttachment";
import { ChatImageAttachment } from "./ChatImageAttachment";

type MessageEntry = Extract<ChatTimelineEntry, { kind: "message" }>;

interface Props {
  entry: MessageEntry;
  /** 전송 실패한 말풍선의 재시도. 없으면 재시도 버튼을 그리지 않는다 */
  onRetry?: (message: ChatMessage) => void;
}

/**
 * 메시지 말풍선.
 *
 * **모서리(`rounded-bubble`)를 이 컴포넌트가 소유하고 `className` 으로 받지 않는다.**
 * Tailwind v4 의 CSS 테마 토큰은 tailwind-merge 가 읽지 못해, 호출부가 다른 radius 를
 * 얹으면 두 클래스가 모두 살아남아 어느 쪽이 이길지 선언 순서에 달리게 된다.
 */
export const ChatMessageBubble = ({ entry, onRetry }: Props) => {
  const { message, isMine, timeLabel, isRead, showTime, isGroupStart } = entry;
  const isFailed = message.delivery === "FAILED";
  const isSending = message.delivery === "SENDING";

  return (
    <div
      className={cn(
        "flex items-end gap-1.5",
        isMine ? "justify-end" : "justify-start",
        // 다른 사람으로 넘어가거나 시간이 벌어지면 묶음이 갈린다 — 그 사이만 벌린다
        isGroupStart ? "mt-3" : "mt-0.5",
      )}
    >
      {isMine && isFailed && onRetry && message.clientMessageId && (
        <IconButton
          icon={<RotateCcw className="size-3.5" />}
          label="다시 보내기"
          size="icon-xs"
          onClick={() => onRetry(message)}
        />
      )}

      {/* 내 메시지의 시각·읽음은 말풍선 왼쪽(안쪽)에 붙는다 */}
      {isMine && (showTime || isFailed || isSending) && (
        <span className="flex shrink-0 flex-col items-end text-caption text-muted-ink">
          {isFailed && <span className="text-danger">전송 실패</span>}
          {isSending && <span>보내는 중</span>}
          {isRead && !isFailed && !isSending && <span className="text-brand-dark">읽음</span>}
          {showTime && !isFailed && !isSending && <span>{timeLabel}</span>}
        </span>
      )}

      <div
        className={cn(
          "flex max-w-[min(32rem,75%)] flex-col gap-1.5 rounded-bubble px-3 py-2",
          // 전역 `* { user-select: none }` 때문에 이게 없으면 메시지를 복사할 수 없다
          "select-text whitespace-pre-wrap break-words text-body-2",
          isMine ? "bg-brand-primary text-surface" : "bg-surface text-ink ring-1 ring-rule",
          // 실패한 것은 눌러서 다시 보내야 한다는 뜻이라 흐리게 둔다
          isFailed && "opacity-60",
          isSending && "opacity-70",
        )}
      >
        {message.type === "IMAGE" && <ChatImageAttachment message={message} />}
        {message.type === "FILE" && <ChatFileAttachment message={message} isMine={isMine} />}

        {/* 첨부에 딸린 캡션은 없을 수 있다 */}
        {message.content && <span>{message.content}</span>}
      </div>

      {!isMine && showTime && (
        <span className="shrink-0 text-caption text-muted-ink">{timeLabel}</span>
      )}
    </div>
  );
};
