import { LogOut } from "lucide-react";

import { Avatar } from "@shared/ui/avatar";
import { StatusDot } from "@shared/ui/badges";
import { IconButton } from "@shared/ui/buttons";
import type { ChatPeer } from "@entities/chat";

interface Props {
  peer: ChatPeer | null;
  /** 대화방 나가기(내 목록에서 감추기). 없으면 버튼을 그리지 않는다 */
  onLeave?: (peerName: string) => void;
}

export const ChatRoomHeader = ({ peer, onLeave }: Props) => {
  // 상대가 탈퇴하면 서버가 이름·부서를 null 로 준다
  const name = peer?.name ?? "알 수 없는 사용자";
  const isOnline = peer?.online ?? false;

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-rule px-4 py-3">
      <Avatar name={name} size="lg" />

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-body-4 text-ink">{name}</span>
          {peer?.department && (
            <span className="truncate text-caption text-muted-ink">{peer.department}</span>
          )}
        </span>

        {/* 색만으로 접속 상태를 말하지 않는다 — StatusDot 이 라벨을 강제한다 */}
        <StatusDot
          tone={isOnline ? "progress" : "done"}
          label={isOnline ? "온라인" : "오프라인"}
          className="text-caption"
        />
      </div>

      {onLeave && (
        <IconButton
          icon={<LogOut className="size-4.5" />}
          label="대화방 나가기"
          onClick={() => onLeave(name)}
          className="ms-auto"
        />
      )}
    </header>
  );
};
