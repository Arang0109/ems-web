import { MessageCirclePlus } from "lucide-react";

import { useIsMobile } from "@shared/model";
import { Avatar } from "@shared/ui/avatar";
import { IconButton } from "@shared/ui/buttons";
import { Drawer } from "@shared/ui/drawer";
import { EmptyText } from "@shared/ui/feedback";
import { Search } from "@shared/ui/form";
import { Skeleton } from "@shared/ui/skeletons";

import { useOpenChatRoom } from "../model/hooks/use-open-chat-room";

const LoadingRows = () => (
  <ul className="space-y-2">
    {Array.from({ length: 4 }, (_, i) => (
      <li key={i} className="flex items-center gap-3 px-1 py-2">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 w-28" />
      </li>
    ))}
  </ul>
);

/**
 * 새 대화 — 트리거 버튼과 상대 목록을 함께 소유한다.
 *
 * 모달이 아니라 `Drawer` 다. 고르면 바로 대화로 넘어가는 통과 지점이라 화면 한가운데를
 * 덮어 맥락을 끊을 이유가 없고, 닫아서 잃을 입력값도 없다.
 *
 * 서버가 방 개설을 멱등으로 처리하므로 "새 대화"와 "이어가기"를 화면에서 가르지 않는다 —
 * 이미 대화하던 상대를 골라도 그 방으로 들어간다.
 */
export const ChatContactPicker = () => {
  const {
    isOpen,
    setOpen,
    open,
    query,
    setQuery,
    contacts,
    isEmpty,
    isLoading,
    isOpening,
    error,
    handleSelect,
  } = useOpenChatRoom();

  const isMobile = useIsMobile();

  return (
    <>
      <IconButton
        icon={<MessageCirclePlus className="size-4.5" />}
        label="새 대화 시작"
        onClick={open}
      />

      <Drawer
        open={isOpen}
        onOpenChange={setOpen}
        side={isMobile ? "bottom" : "right"}
        title="새 대화"
        description="대화할 상대를 선택하세요."
      >
        <div className="space-y-3">
          <Search
            filter={query}
            setFilter={setQuery}
            placeholder="이름, 부서 검색 ..."
            className="max-w-none"
          />

          {isLoading && <LoadingRows />}

          {!isLoading && error && <EmptyText>{error}</EmptyText>}

          {!isLoading && !error && isEmpty && (
            <EmptyText>대화할 수 있는 상대가 없습니다.</EmptyText>
          )}

          {/* 검색으로 가려진 것과 상대가 아예 없는 것은 다른 상황이다 */}
          {!isLoading && !error && !isEmpty && contacts.length === 0 && (
            <EmptyText>검색 결과가 없습니다.</EmptyText>
          )}

          <ul className="space-y-0.5">
            {contacts.map((contact) => (
              <li key={contact.userId}>
                <button
                  type="button"
                  disabled={isOpening}
                  onClick={() => void handleSelect(contact)}
                  className="flex w-full items-center gap-3 rounded-nav px-2 py-2.5 text-start transition-colors motion-reduce:transition-none hover:bg-canvas disabled:opacity-50"
                >
                  <Avatar
                    name={contact.name}
                    online={contact.online}
                    statusLabel={contact.online ? "온라인" : "오프라인"}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body-4 text-ink">{contact.name}</span>
                    <span className="truncate text-caption text-muted-ink">
                      {contact.department}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </>
  );
};
