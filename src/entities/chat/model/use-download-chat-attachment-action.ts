import { useMutation } from "@tanstack/react-query";

import { readBlobErrorMessage } from "@shared/api";
import { parseAttachmentFilename } from "@shared/lib";

import { chatApi } from "../api/api";
import type { ChatAttachmentDownload } from "./types";

/**
 * 첨부 파일 내려받기.
 *
 * `useEntityMutation` 을 쓰지 않는다 — 무효화할 캐시가 없고, 응답이 `ApiResponse` 봉투가
 * 아니라 바이너리라 `unwrapMessage` 의 계약 밖이다(문서 다운로드 훅들과 같은 갈래).
 *
 * **엔티티는 DOM 을 만지지 않는다.** `{ blob, filename }` 만 돌려주고 실제 저장은 feature 가 한다.
 */
export const useDownloadChatAttachmentAction = () => {
  const mutation = useMutation({
    mutationFn: async ({
      roomId,
      messageId,
      fallbackFilename,
    }: {
      roomId: number;
      messageId: string;
      /** 헤더에 파일명이 없을 때 쓸 이름 — 메시지에 실려 온 원본 파일명 */
      fallbackFilename: string;
    }): Promise<ChatAttachmentDownload> => {
      const res = await chatApi.downloadAttachment(roomId, messageId);

      // 실패해도 blob 으로 도착한다(responseType 이 blob 이고, 인터셉터가 에러 응답을
      // resolve 로 되돌린다) — 본문을 읽어야 사유를 안다
      if (res.status >= 400) {
        const message = await readBlobErrorMessage(res.data);
        throw new Error(message ?? "첨부 파일을 내려받지 못했습니다.");
      }

      return {
        blob: res.data,
        filename:
          parseAttachmentFilename(res.headers["content-disposition"]) || fallbackFilename,
      };
    },
  });

  return {
    downloadAttachment: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
