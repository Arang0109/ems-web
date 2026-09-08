import { useDownloadChatAttachmentAction, type ChatMessage } from "@entities/chat";
import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

/**
 * 첨부 파일 저장 — 엔티티가 준 `{ blob, filename }` 을 브라우저 다운로드로 잇는다.
 *
 * 엔티티는 DOM 을 만지지 않으므로 실제 저장 트리거는 여기 있다.
 */
export const useDownloadChatAttachment = () => {
  const { downloadAttachment, isLoading } = useDownloadChatAttachmentAction();

  const download = async (message: ChatMessage) => {
    if (!message.messageId || !message.attachment) return;

    try {
      const { blob, filename } = await downloadAttachment({
        roomId: message.roomId,
        messageId: message.messageId,
        fallbackFilename: message.attachment.filename,
      });

      downloadBlob(blob, filename);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "첨부 파일을 내려받지 못했습니다.");
    }
  };

  return { download, isLoading };
};
