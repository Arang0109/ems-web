import { useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { CHAT_CONTENT_MAX_LENGTH } from "@entities/chat";
import { formatFileSize } from "@shared/lib";
import { IconButton } from "@shared/ui/buttons";

import { useSendChatMessage } from "../model/hooks/use-send-chat-message";

interface Props {
  roomId: number;
  className?: string;
}

/**
 * 메시지 입력창.
 *
 * `shared/ui/form` 의 `Textarea` 를 쓰지 않는다 — 그쪽은 라벨과 `Field` 셸을 항상 그리는
 * 폼 필드다. 여기는 라벨이 없고 테두리도 없으며 엔터가 줄바꿈이 아니라 전송이라, 폼 필드와
 * 성격이 다르다. auto-grow 는 `field-sizing-content` 한 줄이면 되므로 JS 로 높이를 재지 않는다.
 */
export const ChatComposer = ({ roomId, className }: Props) => {
  const { form, canSend, isDisabled, handleChange, handleSelectFile, handleSubmit } =
    useSendChatMessage({ roomId });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 같은 파일을 다시 고를 수 있게 값을 비운다 — 값이 남아 있으면 change 가 안 난다 */
  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 엔터와 버튼 두 경로가 있으므로 한 곳으로 모은다 — 한쪽만 input 을 비우면
  // 방금 보낸 파일을 다시 고를 수 없게 된다.
  const submit = () => {
    void handleSubmit();
    resetFileInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중의 엔터는 한글 확정이지 전송이 아니다. 이걸 빼면 "안녕" 을 치다
    // 첫 글자가 확정되는 순간 메시지가 나간다.
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const clearFile = () => {
    handleSelectFile(null);
    resetFileInput();
  };

  return (
    <div className={cn("shrink-0 border-t border-rule bg-surface px-3 py-2.5", className)}>
      {form.file && (
        <div className="mb-2 flex items-center gap-2 rounded-nav bg-canvas px-3 py-2">
          <Paperclip className="size-4 shrink-0 text-ink-soft" />
          <span className="truncate text-body-3 text-ink">{form.file.name}</span>
          <span className="shrink-0 text-caption text-muted-ink">
            {formatFileSize(form.file.size)}
          </span>
          <IconButton
            icon={<X className="size-4" />}
            label="첨부 취소"
            size="icon-sm"
            onClick={clearFile}
            className="ms-auto shrink-0"
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
        />
        <IconButton
          icon={<Paperclip className="size-4.5" />}
          label="파일 첨부"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
        />

        <textarea
          value={form.content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
          maxLength={CHAT_CONTENT_MAX_LENGTH}
          placeholder="메시지를 입력하세요"
          aria-label="메시지 입력"
          className={cn(
            // field-sizing-content : 내용에 따라 높이가 늘어난다(JS 계산 불필요)
            "field-sizing-content max-h-40 min-h-9 flex-1 resize-none rounded-nav bg-canvas px-3 py-2",
            "text-body-2 text-ink outline-none placeholder:text-muted-ink",
            "focus-visible:ring-3 focus-visible:ring-brand-primary/12",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        <IconButton
          icon={<Send className="size-4.5" />}
          label="보내기"
          variant="default"
          onClick={submit}
          disabled={!canSend || isDisabled}
        />
      </div>
    </div>
  );
};
