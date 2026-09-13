import { ArrowDown } from "lucide-react";
import type { RefObject } from "react";

import type { ChatMessage } from "@entities/chat";
import { Button } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { Skeleton } from "@shared/ui/skeletons";

import type { ChatTimelineEntry } from "../../model/types";
import { ChatDaySeparator } from "./ChatDaySeparator";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatUnreadDivider } from "./ChatUnreadDivider";

interface Props {
  timeline: ChatTimelineEntry[];
  isLoading: boolean;
  error: string | null;
  isLoadingMore: boolean;
  hasNewBelow: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  topSentinelRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onScrollToBottom: () => void;
  onRetry?: (message: ChatMessage) => void;
}

const LoadingBubbles = () => (
  <div className="space-y-3 p-4">
    {[60, 40, 72, 36].map((width, i) => (
      <div key={i} className={i % 2 === 0 ? "flex" : "flex justify-end"}>
        <Skeleton className="h-9" style={{ width: `${width}%` }} />
      </div>
    ))}
  </div>
);

export const ChatMessageList = ({
  timeline,
  isLoading,
  error,
  isLoadingMore,
  hasNewBelow,
  scrollRef,
  topSentinelRef,
  onScroll,
  onScrollToBottom,
  onRetry,
}: Props) => (
  // relative : "새 메시지" 버튼이 스크롤을 따라다니지 않고 영역 바닥에 떠 있어야 한다
  <div className="relative flex min-h-0 flex-1 flex-col">
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-canvas px-4 py-2"
    >
      {/* 위로 스크롤하다 이 지점이 보이면 과거를 더 받는다 */}
      <div ref={topSentinelRef} aria-hidden="true" />

      {isLoadingMore && (
        <p className="py-2 text-center text-caption text-muted-ink">이전 대화를 불러오는 중...</p>
      )}

      {isLoading && <LoadingBubbles />}

      {!isLoading && error && <EmptyText className="py-12">{error}</EmptyText>}

      {!isLoading && !error && timeline.length === 0 && (
        <EmptyText className="py-12">아직 주고받은 메시지가 없습니다.</EmptyText>
      )}

      {timeline.map((entry) => {
        if (entry.kind === "day") return <ChatDaySeparator key={entry.key} label={entry.label} />;
        if (entry.kind === "unread-divider") return <ChatUnreadDivider key={entry.key} />;
        return <ChatMessageBubble key={entry.key} entry={entry} onRetry={onRetry} />;
      })}
    </div>

    {hasNewBelow && (
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <Button
          size="sm"
          startIcon={ArrowDown}
          onClick={onScrollToBottom}
          className="pointer-events-auto rounded-full shadow-panel"
        >
          새 메시지
        </Button>
      </div>
    )}
  </div>
);
