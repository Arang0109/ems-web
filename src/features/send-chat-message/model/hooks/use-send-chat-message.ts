import { useState } from "react";

import { useAuth } from "@entities/auth";
import { CHAT_ATTACHMENT_MAX_BYTES, useSendChatMessageAction } from "@entities/chat";
import { formatFileSize } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import { getDefaultChatComposerForm, type ChatComposerForm } from "../types";

interface Props {
  roomId: number;
}

/**
 * 메시지 작성·전송.
 *
 * 전송이 끝나기를 기다리지 않고 입력창을 먼저 비운다 — 말풍선은 이미 화면에 떠 있고,
 * 실패하면 그 말풍선에 재시도 버튼이 붙는다. 입력창을 잡아 두면 다음 문장을 못 쓴다.
 */
export const useSendChatMessage = ({ roomId }: Props) => {
  const [form, setForm] = useState<ChatComposerForm>(getDefaultChatComposerForm);
  const { user } = useAuth();
  const { sendMessage } = useSendChatMessageAction();

  const myUserId = user?.userId ?? null;
  const canSend = Boolean(form.content.trim() || form.file);

  const handleChange = (value: string) => setForm((prev) => ({ ...prev, content: value }));

  const handleSelectFile = (file: File | null) => {
    // 10MB 를 넘으면 서버가 413 을 준다. 업로드를 끝내고 거절당하느니 여기서 막는다.
    if (file && file.size > CHAT_ATTACHMENT_MAX_BYTES) {
      toast.error(
        `첨부 파일은 ${formatFileSize(CHAT_ATTACHMENT_MAX_BYTES)} 까지 보낼 수 있습니다.`,
      );
      return;
    }
    setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async () => {
    if (!canSend || myUserId === null) return;

    const content = form.content.trim();
    const { file } = form;
    // 입력창은 응답을 기다리지 않고 바로 비운다 — 말풍선은 이미 화면에 떠 있고,
    // 실패하면 그 말풍선에 재시도 버튼이 붙는다. 잡아 두면 다음 문장을 못 쓴다.
    setForm(getDefaultChatComposerForm());

    try {
      await sendMessage({
        roomId,
        clientMessageId: crypto.randomUUID(),
        content,
        file,
        myUserId,
        myName: user?.name ?? "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "메시지를 보내지 못했습니다.");
    }
  };

  return {
    form,
    canSend,
    isDisabled: myUserId === null,
    handleChange,
    handleSelectFile,
    handleSubmit,
  };
};
