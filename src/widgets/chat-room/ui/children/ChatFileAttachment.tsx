import { Download, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@entities/chat";
import { useDownloadChatAttachment } from "@features/download-chat-attachment";
import { formatFileSize } from "@shared/lib";
import { IconButton } from "@shared/ui/buttons";

interface Props {
  message: ChatMessage;
  /** 내 말풍선 위에 얹히면 글자색이 뒤집힌다 */
  isMine: boolean;
}

export const ChatFileAttachment = ({ message, isMine }: Props) => {
  const { download, isLoading } = useDownloadChatAttachment();
  const attachment = message.attachment;

  if (!attachment) return null;

  return (
    <span className="flex items-center gap-2">
      <FileText className={cn("size-5 shrink-0", isMine ? "text-surface" : "text-ink-soft")} />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-3">{attachment.filename}</span>
        <span className={cn("text-caption", isMine ? "text-surface/80" : "text-muted-ink")}>
          {formatFileSize(attachment.size)}
        </span>
      </span>

      {/* 아직 서버에 닿지 않은 첨부는 내려받을 것이 없다 */}
      {message.messageId && (
        <IconButton
          icon={<Download className="size-4" />}
          label={`${attachment.filename} 내려받기`}
          size="icon-sm"
          disabled={isLoading}
          onClick={() => void download(message)}
          className={cn("ms-1 shrink-0", isMine && "text-surface hover:bg-surface/15")}
        />
      )}
    </span>
  );
};
