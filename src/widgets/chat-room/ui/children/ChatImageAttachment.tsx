import { useState } from "react";
import { Download, ImageOff } from "lucide-react";

import { useChatAttachment, type ChatMessage } from "@entities/chat";
import { useDownloadChatAttachment } from "@features/download-chat-attachment";
import { Button } from "@shared/ui/buttons";
import { ImageViewerDialog } from "@shared/ui/dialogs";
import { Skeleton } from "@shared/ui/skeletons";

interface Props {
  message: ChatMessage;
}

/**
 * 말풍선 안의 이미지 — 누르면 확대해서 본다.
 *
 * 아직 전송 중인 말풍선은 로컬 미리보기(`localPreviewUrl`)를 쓴다. 서버에서 다시 받으면
 * 방금 고른 이미지가 잠깐 사라졌다 나타난다.
 */
export const ChatImageAttachment = ({ message }: Props) => {
  const [isViewerOpen, setViewerOpen] = useState(false);
  const { download, isLoading: isDownloading } = useDownloadChatAttachment();

  const { objectUrl, isLoading, isError } = useChatAttachment({
    roomId: message.roomId,
    messageId: message.messageId,
    // 로컬 미리보기가 있으면 굳이 받아 오지 않는다
    enabled: !message.localPreviewUrl,
  });

  const src = message.localPreviewUrl ?? objectUrl;
  const filename = message.attachment?.filename ?? "첨부 이미지";

  if (isError) {
    return (
      <span className="flex items-center gap-1.5 text-caption text-muted-ink">
        <ImageOff className="size-4" />
        이미지를 불러오지 못했습니다
      </span>
    );
  }

  if (!src) {
    return <Skeleton className="h-40 w-52" aria-busy={isLoading} aria-label="이미지 불러오는 중" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        aria-label={`${filename} 크게 보기`}
        className="cursor-zoom-in"
      >
        <img
          src={src}
          alt={filename}
          // max-h : 세로로 긴 사진 하나가 대화를 통째로 밀어내지 않게 한다
          className="max-h-80 max-w-full rounded-nav object-contain"
        />
      </button>

      <ImageViewerDialog
        open={isViewerOpen}
        onOpenChange={setViewerOpen}
        src={src}
        title={filename}
        toolbar={
          // 아직 서버에 닿지 않은 첨부는 내려받을 것이 없다
          message.messageId ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${filename} 내려받기`}
              disabled={isDownloading}
              onClick={() => void download(message)}
            >
              <Download size={18} />
            </Button>
          ) : undefined
        }
      />
    </>
  );
};
