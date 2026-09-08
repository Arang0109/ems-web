import { useCallback, useEffect, useRef } from "react";

import {
  getLastServerMessageId,
  setActiveChatRoom,
  useMarkChatRoomReadAction,
  type ChatMessage,
} from "@entities/chat";

interface Props {
  roomId: number;
  messages: ChatMessage[];
  /** 바닥을 보고 있는지 — 위를 훑는 중이라면 읽은 것이 아니다 */
  isAtBottom: boolean;
}

/**
 * 읽음 보고 — 언제 서버에 "여기까지 봤다"고 알릴지 정한다.
 *
 * feature 슬라이스를 만들지 않았다. 확인 창도 토스트도 화면 이동도 없는 자동 부수효과라
 * 사용자 시나리오라고 부를 것이 없고, 트리거가 전부 이 화면의 스크롤·포커스에 달려 있다.
 *
 * **후보는 언제나 타임라인의 마지막 서버 메시지다.** 그래서 위로 스크롤해 옛 대화를 봐도
 * 커서가 뒤로 가지 않는다(서버도 역행을 무시하지만, 애초에 보내지 않는 편이 낫다).
 */
export const useChatReadReporter = ({ roomId, messages, isAtBottom }: Props) => {
  const { markRead } = useMarkChatRoomReadAction();

  /** 이미 보고한 id — 같은 값을 반복해 보내지 않는다 */
  const lastReportedRef = useRef<string | null>(null);
  /** 보고가 날아가는 중에 또 보내지 않는다 */
  const isSendingRef = useRef(false);

  const candidate = getLastServerMessageId(messages);

  const report = useCallback(async () => {
    if (!candidate) return;
    if (lastReportedRef.current === candidate) return;
    if (isSendingRef.current) return;
    // 탭이 뒤에 있으면 화면에 떠 있어도 읽은 것이 아니다
    if (document.visibilityState !== "visible") return;

    isSendingRef.current = true;
    try {
      await markRead({ roomId, lastReadMessageId: candidate });
      lastReportedRef.current = candidate;
    } catch {
      // 실패해도 알리지 않는다 — 사용자가 한 일이 아니고, 다음 트리거가 다시 보낸다
    } finally {
      isSendingRef.current = false;
    }
  }, [candidate, markRead, roomId]);

  // 바닥을 보고 있고 말단이 바뀌면 보고한다 (방 진입 직후·새 메시지 도착·바닥 도달을 모두 덮는다)
  useEffect(() => {
    if (!isAtBottom) return;
    void report();
  }, [isAtBottom, report]);

  // 다른 탭에 갔다 돌아오면 그때 읽은 것이 된다
  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === "visible" && isAtBottom) void report();
    };

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);

    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [isAtBottom, report]);

  // 지금 보고 있는 방을 알린다 — 이 방으로 오는 메시지는 안읽음으로 세지 않는다.
  // 방이 바뀌면 컴포넌트가 리마운트되므로 정리도 자연스럽게 따라온다.
  useEffect(() => {
    setActiveChatRoom(roomId);
    return () => setActiveChatRoom(null);
  }, [roomId]);
};
