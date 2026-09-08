import { MessageCircle } from "lucide-react";

import { ChatContactPicker } from "@features/open-chat-room";
import { useHideChatRoom } from "@features/hide-chat-room";
import { PageLayout } from "@shared/ui/layout";
import { TableEmptyState } from "@shared/ui/table";
import { ChatRoom } from "@widgets/chat-room";
import { ChatRoomList } from "@widgets/chat-room-list";

import { useChatPage } from "./model/use-chat-page";

interface NoticeProps {
  label: string;
  subLabel: string;
}

const Notice = ({ label, subLabel }: NoticeProps) => (
  <div className="flex min-h-0 flex-1 items-center justify-center rounded-panel bg-surface ring-1 ring-rule">
    <TableEmptyState
      icon={<MessageCircle className="size-6" />}
      label={label}
      subLabel={subLabel}
    />
  </div>
);

export const ChatPage = () => {
  const { roomId, myUserId, isMobile, showList, showRoom } = useChatPage();
  const { leave } = useHideChatRoom();

  // 모바일에서 대화를 열면 목록으로 돌아갈 길이 필요하다.
  // 뒤로가기는 `PageLayout` 이 md 미만에서만 그리므로 따로 분기하지 않는다.
  const isMobileRoom = isMobile && roomId !== null;

  return (
    <PageLayout
      title="채팅"
      description={isMobileRoom ? undefined : "1:1 대화를 지원하는 채팅 서비스입니다."}
      showBack={isMobileRoom}
      backTo="/chat"
      // 세로 배치를 flex 로 바꾼다 — 본문이 남은 높이를 정확히 받아야 안쪽만 스크롤된다.
      // space-y-0 은 기본 space-y-5 를 지우는 것이고, 간격은 gap 이 맡는다.
      className="flex h-full min-h-0 flex-col gap-4 space-y-0"
    >
      {myUserId === null ? (
        // 내 사용자 id 를 모르면 어느 말풍선이 내 것인지 가려낼 수 없다.
        // 이 필드가 생기기 전에 로그인해 둔 경우이고, 재로그인하면 채워진다.
        <Notice
          label="다시 로그인해 주세요"
          subLabel="채팅을 쓰려면 로그인 정보를 새로 받아야 합니다. 로그아웃 후 다시 로그인해 주세요."
        />
      ) : (
        <div className="flex min-h-0 flex-1 gap-4">
          {showList && (
            <ChatRoomList
              selectedRoomId={roomId}
              action={<ChatContactPicker />}
              className="w-full md:w-72 md:shrink-0"
            />
          )}

          {showRoom &&
            (roomId === null ? (
              <Notice
                label="대화를 선택하세요"
                subLabel="왼쪽 목록에서 대화를 고르면 여기에 표시됩니다."
              />
            ) : (
              // key : 방을 바꾸면 스크롤 위치·안읽음 기준선이 전부 새로 시작해야 한다.
              // 초기화 목록을 훅 안에서 관리하는 것보다 리마운트가 빠뜨릴 데가 없다.
              <ChatRoom
                key={roomId}
                roomId={roomId}
                myUserId={myUserId}
                onLeave={(peerName) => void leave(roomId, peerName)}
                className="flex-1"
              />
            ))}
        </div>
      )}
    </PageLayout>
  );
};
