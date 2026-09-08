import { cn } from "@/lib/utils";
import { ChatComposer, useRetryChatMessage } from "@features/send-chat-message";

import { useChatRoom } from "../model/use-chat-room";
import { ChatMessageList } from "./children/ChatMessageList";
import { ChatRoomHeader } from "./children/ChatRoomHeader";

interface Props {
  roomId: number;
  myUserId: number;
  /** 대화방 나가기. 확인 문구에 쓰도록 상대 이름을 넘긴다 */
  onLeave?: (peerName: string) => void;
  className?: string;
}

/**
 * 대화방 — 헤더·메시지·입력창을 세로로 쌓고 **가운데만 스크롤한다.**
 *
 * `min-h-0` 이 빠지면 flex 자식이 내용만큼 늘어나 스크롤이 페이지 전체로 새어 나간다.
 */
export const ChatRoom = ({ roomId, myUserId, onLeave, className }: Props) => {
  const {
    room,
    timeline,
    isLoading,
    error,
    isLoadingMore,
    scrollRef,
    topSentinelRef,
    handleScroll,
    hasNewBelow,
    scrollToBottom,
  } = useChatRoom({ roomId, myUserId });

  const { retry } = useRetryChatMessage({ roomId });

  return (
    <section
      aria-label="대화"
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-panel bg-surface ring-1 ring-rule",
        className,
      )}
    >
      <ChatRoomHeader peer={room?.peer ?? null} onLeave={onLeave} />

      <ChatMessageList
        timeline={timeline}
        isLoading={isLoading}
        error={error}
        isLoadingMore={isLoadingMore}
        hasNewBelow={hasNewBelow}
        scrollRef={scrollRef}
        topSentinelRef={topSentinelRef}
        onScroll={handleScroll}
        onScrollToBottom={scrollToBottom}
        onRetry={(message) => void retry(message)}
      />

      <ChatComposer roomId={roomId} />
    </section>
  );
};
