import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unwrapMessage } from "@shared/api";

import { chatApi } from "../api/api";
import { applyMyRead } from "./chat-cache";

/**
 * 읽음 보고.
 *
 * `useEntityMutation` 을 쓰지 않는다 — 그 어댑터는 성공 시 키를 무효화하는데, 여기서
 * 메시지 목록까지 무효화되면 방을 볼 때마다 대화가 다시 로드되며 스크롤이 튄다.
 * 바뀌는 값(내 커서·안읽음 0)이 정해져 있으므로 캐시를 직접 고친다.
 */
export const useMarkChatRoomReadAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      roomId,
      lastReadMessageId,
    }: {
      roomId: number;
      /** **서버가 채번한 24자 16진 id.** `clientMessageId` 를 보내면 400 이다 */
      lastReadMessageId: string;
    }) => {
      unwrapMessage(await chatApi.markRead(roomId, { lastReadMessageId }));
    },

    onSuccess: (_result, { roomId, lastReadMessageId }) => {
      applyMyRead(queryClient, roomId, lastReadMessageId);
    },
  });

  return {
    markRead: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
