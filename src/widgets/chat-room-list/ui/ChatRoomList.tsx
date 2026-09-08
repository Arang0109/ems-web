import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { EmptyText } from "@shared/ui/feedback";
import { Search } from "@shared/ui/form";
import { Skeleton } from "@shared/ui/skeletons";

import { useChatRoomList } from "../model/use-chat-room-list";
import { ChatRoomRow } from "./children/ChatRoomRow";

interface Props {
  /** 지금 열려 있는 대화방 — 목록에서 강조한다 */
  selectedRoomId: number | null;
  /**
   * 헤더 우측 슬롯 — 새 대화 트리거가 들어온다.
   *
   * 콜백이 아니라 노드를 받는다. 트리거와 상대 목록은 한 몸이고 그 상태는 feature 가
   * 소유해야 하므로, 목록 위젯이 "새 대화" 라는 동작을 알 필요가 없다.
   */
  action?: ReactNode;
  className?: string;
}

const LoadingRows = () => (
  <ul className="space-y-1 px-2">
    {Array.from({ length: 5 }, (_, i) => (
      <li key={i} className="flex items-center gap-3 px-3 py-2.5">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </li>
    ))}
  </ul>
);

/**
 * 대화 목록 — 데스크탑에서는 좌측 열, 모바일에서는 `/chat` 의 전체 화면이다.
 *
 * 헤더(검색·새 대화)는 고정하고 목록만 스크롤한다. 대화가 쌓여도 검색창을 찾아
 * 위로 올라갈 일이 없어야 한다.
 */
export const ChatRoomList = ({ selectedRoomId, action, className }: Props) => {
  const { rows, isEmpty, query, setQuery, isLoading, error } = useChatRoomList();

  return (
    <section
      aria-label="대화 목록"
      className={cn(
        "flex min-h-0 flex-col rounded-panel bg-surface ring-1 ring-rule",
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-rule p-3">
        <Search
          filter={query}
          setFilter={setQuery}
          placeholder="이름 검색 ..."
          className="max-w-none flex-1"
        />
        {action}
      </header>

      {/* min-h-0 이 있어야 flex 자식이 줄어들어 여기서 스크롤이 생긴다 */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {isLoading && <LoadingRows />}

        {!isLoading && error && <EmptyText className="px-4">{error}</EmptyText>}

        {!isLoading && !error && isEmpty && (
          <EmptyText className="px-4">
            아직 대화가 없습니다. 새 대화를 시작해 보세요.
          </EmptyText>
        )}

        {/* 검색으로 가려진 것과 대화 자체가 없는 것은 다른 상황이라 문구를 나눈다 */}
        {!isLoading && !error && !isEmpty && rows.length === 0 && (
          <EmptyText className="px-4">검색 결과가 없습니다.</EmptyText>
        )}

        {rows.length > 0 && (
          <ul className="space-y-0.5 px-2">
            {rows.map((row) => (
              <ChatRoomRow
                key={row.roomId}
                row={row}
                isSelected={row.roomId === selectedRoomId}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
