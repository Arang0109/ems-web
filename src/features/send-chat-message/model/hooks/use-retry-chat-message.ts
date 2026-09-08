import { useAuth } from "@entities/auth";
import { useSendChatMessageAction, type ChatMessage } from "@entities/chat";
import { toast } from "@shared/ui/toasts";

interface Props {
  roomId: number;
}

/**
 * 실패한 말풍선 다시 보내기.
 *
 * 입력창과 상태를 공유하지 않으므로 작성 훅에서 떼어 냈다 — 재시도 버튼은 말풍선에 붙고,
 * 그 말풍선은 입력창이 아니라 대화 목록이 그린다.
 *
 * **같은 `clientMessageId` 를 다시 쓴다.** 새로 발급하면 실패한 말풍선이 화면에 남은 채
 * 같은 내용이 하나 더 생긴다.
 */
export const useRetryChatMessage = ({ roomId }: Props) => {
  const { user } = useAuth();
  const { sendMessage } = useSendChatMessageAction();

  const retry = async (message: ChatMessage) => {
    const clientMessageId = message.clientMessageId;
    if (!clientMessageId || user?.userId == null) return;

    // 첨부는 다시 보낼 수 없다 — 캐시에는 파일명·크기만 남아 있고 `File` 자체는 없다.
    // 조용히 텍스트만 보내면 사용자는 파일이 갔다고 믿게 되므로 분명히 알린다.
    if (message.attachment) {
      toast.error("첨부 파일은 다시 보낼 수 없습니다. 파일을 다시 선택해 주세요.");
      return;
    }

    try {
      await sendMessage({
        roomId,
        clientMessageId,
        content: message.content ?? "",
        file: null,
        myUserId: user.userId,
        myName: user.name ?? "",
        isRetry: true,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "메시지를 보내지 못했습니다.");
    }
  };

  return { retry };
};
