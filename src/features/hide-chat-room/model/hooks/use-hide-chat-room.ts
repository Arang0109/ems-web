import { useNavigate } from "react-router";

import { useHideChatRoomAction } from "@entities/chat";
import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

/**
 * 대화방 나가기.
 *
 * 되돌리기 어려운 동작은 아니지만(상대가 말을 걸면 돌아온다) 목록에서 사라지는 것이
 * 삭제로 읽히므로 확인을 한 번 받는다. 문구로 "기록은 남는다"를 알린다.
 */
export const useHideChatRoom = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { hideRoom } = useHideChatRoomAction();

  const leave = async (roomId: number, peerName: string) => {
    const isConfirmed = await confirm({
      title: "대화방 나가기",
      description: `${peerName}님과의 대화를 목록에서 감춥니다.\n대화 기록은 지워지지 않고, 상대가 새 메시지를 보내면 다시 나타납니다.`,
      confirmLabel: "나가기",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await hideRoom(roomId);
      toast.success("대화방을 나갔습니다.");
      navigate("/chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "대화방을 나가지 못했습니다.");
    }
  };

  return { leave };
};
