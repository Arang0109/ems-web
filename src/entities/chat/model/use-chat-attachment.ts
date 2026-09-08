import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { chatApi } from "../api/api";
import { chatKeys } from "./query-keys";

interface Props {
  roomId: number;
  /** 낙관적 말풍선은 아직 서버 id 가 없어 받아 올 것도 없다 */
  messageId: string | null;
  /** 화면에 그려질 때만 받는다 — 목록을 스크롤하며 지나친 이미지까지 내려받지 않도록 */
  enabled?: boolean;
}

/**
 * 첨부 이미지를 화면에 그릴 수 있는 URL 로 바꾼다.
 *
 * **`<img src>` 로 직접 걸 수 없다.** 다운로드에 `Authorization` 헤더가 필요한데
 * 이미지 요청에는 헤더를 붙일 방법이 없고, presigned URL 도 아직 없다. 그래서
 * `fetch` → `blob` → `createObjectURL` 을 거친다.
 *
 * blob 자체는 react-query 가 캐시하고(같은 이미지를 두 번 받지 않는다), 거기서 만든
 * object URL 은 **이 훅을 쓰는 컴포넌트가 사라질 때 돌려준다.** 캐시에 URL 을 담아 두면
 * 누가 언제 해제할지가 모호해진다.
 */
export const useChatAttachment = ({ roomId, messageId, enabled = true }: Props) => {
  const query = useQuery({
    queryKey: chatKeys.attachment(roomId, messageId as string),
    queryFn: async () => (await chatApi.downloadAttachment(roomId, messageId as string)).data,
    enabled: enabled && messageId !== null,
    // 첨부는 바뀌지 않는다(서버에 수정이 없다) — 한 번 받으면 계속 쓴다
    staleTime: Infinity,
  });

  const blob = query.data;

  // blob 하나당 URL 하나. `useEffect` 로 만들어 state 에 담으면 URL 이 없는 프레임이
  // 한 번 그려져 이미지가 깜빡인다.
  const objectUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  // 해제만 effect 가 맡는다 — 컴포넌트가 사라지거나 blob 이 바뀌면 이전 URL 을 돌려준다
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return {
    objectUrl,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
