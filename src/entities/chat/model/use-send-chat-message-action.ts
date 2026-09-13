import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toErrorMessage, unwrapMessage } from "@shared/api";

import { chatApi } from "../api/api";
import { toChatMessage } from "../api/mapper";
import { findMessageByClientId } from "../lib/message-page";
import { applyMessageToRoomList } from "../lib/room-list";
import {
  failMessage,
  putMessage,
  readMessagePages,
  retryMessage,
  updateRoomList,
} from "./chat-cache";
import type { ChatMessage } from "./types";

export type SendChatMessageInput = {
  roomId: number;
  /** 낙관적 말풍선을 잇는 키. 재전송할 때는 같은 값을 다시 쓴다 */
  clientMessageId: string;
  content: string;
  file: File | null;
  /** 내 사용자 id — 낙관적 말풍선을 내 것으로 그리려면 필요하다 */
  myUserId: number;
  myName: string;
  /** 이미 화면에 있는 실패 말풍선을 다시 보내는 경우 */
  isRetry?: boolean;
};

/**
 * 메시지 전송 — 응답을 기다리지 않고 말풍선을 먼저 띄운다.
 *
 * `useEntityMutation` 을 쓰지 않는다. 그 어댑터는 성공 시 키를 무효화하는데, 여기서는
 * **무효화하면 안 되기** 때문이다(스크롤이 튀고 과거 페이지가 통째로 다시 요청된다).
 * 캐시를 직접 고쳐 넣는 `useReorder*Action` 과 같은 갈래다.
 *
 * 실패해도 **되돌리지 않는다.** 스냅샷을 복원하면 사용자가 쓴 내용이 화면에서 사라져
 * 다시 보낼 대상이 없어진다. 말풍선을 남기고 실패 표시만 얹는다.
 */
export const useSendChatMessageAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ roomId, clientMessageId, content, file }: SendChatMessageInput) => {
      if (file) {
        const form = new FormData();
        form.append("file", file);
        // 파일만 보내는 것이 정상 경로다 — 빈 캡션을 굳이 실어 보내지 않는다
        if (content.trim()) form.append("content", content);
        form.append("clientMessageId", clientMessageId);

        return toChatMessage(unwrapMessage(await chatApi.sendAttachment(roomId, form)));
      }

      return toChatMessage(
        unwrapMessage(await chatApi.sendMessage(roomId, { content, clientMessageId })),
      );
    },

    onMutate: (input) => {
      if (input.isRetry) {
        retryMessage(queryClient, input.roomId, input.clientMessageId);
        return;
      }

      const optimistic: ChatMessage = {
        messageId: null,
        clientMessageId: input.clientMessageId,
        roomId: input.roomId,
        senderId: input.myUserId,
        senderName: input.myName,
        // 서버가 contentType 으로 정하지만, 화면에 미리 그리려면 여기서도 같은 규칙을 쓴다
        type: input.file ? (input.file.type.startsWith("image/") ? "IMAGE" : "FILE") : "TEXT",
        content: input.content || null,
        attachment: input.file
          ? {
              filename: input.file.name,
              contentType: input.file.type || "application/octet-stream",
              size: input.file.size,
            }
          : null,
        // 서버 시각으로 곧 덮이지만, 그전까지 일자 구분선과 정렬에 쓰인다
        sentAt: new Date().toISOString().slice(0, 19),
        delivery: "SENDING",
        localPreviewUrl: input.file?.type.startsWith("image/")
          ? URL.createObjectURL(input.file)
          : undefined,
      };

      putMessage(queryClient, optimistic);
    },

    onSuccess: (message, input) => {
      // 낙관적 말풍선이 서버 메시지로 바뀌면 로컬 미리보기는 쓸 데가 없다.
      // 돌려주지 않으면 탭을 닫을 때까지 blob 이 메모리에 남는다.
      const previous = findMessageByClientId(
        readMessagePages(queryClient, input.roomId),
        input.clientMessageId,
      );
      if (previous?.localPreviewUrl) URL.revokeObjectURL(previous.localPreviewUrl);

      putMessage(queryClient, message);
      updateRoomList(queryClient, (rooms) => applyMessageToRoomList(rooms, message, false));
    },

    onError: (_error, input) => {
      failMessage(queryClient, input.roomId, input.clientMessageId);
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? toErrorMessage(mutation.error, "메시지를 보내지 못했습니다.") : null,
  };
};
