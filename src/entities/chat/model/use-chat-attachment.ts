import { useEffect, useState } from "react";
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  /**
   * URL 을 만드는 것과 돌려주는 것이 **한 effect 안에** 있어야 한다.
   *
   * `useMemo` 로 만들고 effect 로 해제하면 StrictMode 에서 깨진다 — 개발 모드는 effect 를
   * mount → cleanup → mount 로 두 번 돌리는데, 그 사이 `useMemo` 는 다시 계산되지 않아
   * **이미 해제한 URL 이 그대로 남는다.** 그 URL 은 이미 그려진 `<img>` 에서는 멀쩡해 보이지만
   * (브라우저가 디코딩한 비트맵을 갖고 있다) 새 `<img>` 가 다시 요청하는 순간 깨진다.
   * 확대 모달을 열 때 이미지가 깨지던 원인이 이것이다.
   *
   * 여기처럼 두면 StrictMode 의 두 번째 실행이 새 URL 을 만들어 state 를 덮으므로 안전하다.
   * setState 는 외부 리소스를 화면에 잇는 것이라 cascading render 가 아니다.
   */
  useEffect(() => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    // 규칙은 cascading render 를 막으려는 것인데, 여기는 외부 리소스(object URL)를 화면에
    // 잇는 자리라 해당하지 않는다. 생성과 해제가 한 effect 안에 있어야 StrictMode 에서
    // 안전하므로 다른 곳으로 옮길 수도 없다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return {
    // blob 이 사라지면(캐시 정리) 남아 있던 URL 은 이미 해제된 것이라 쓰면 안 된다.
    // effect 안에서 null 로 되돌리는 대신 여기서 거른다.
    objectUrl: blob ? objectUrl : null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
