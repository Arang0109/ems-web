import { useAuth } from "@entities/auth";
import { useChatRealtime } from "@entities/chat";

/**
 * 채팅 실시간 수신을 앱 수명 동안 하나만 연다.
 *
 * 인증 상태와 채팅을 잇는 자리라 app 레이어에 둔다 — entity 는 다른 슬라이스(`auth`)를
 * 모르는 편이 낫고, 그래서 `useChatRealtime` 은 `myUserId` 를 인자로 받는다.
 *
 * 화면에 아무것도 그리지 않는다. 수신한 이벤트는 react-query 캐시로 들어가고,
 * 대화 목록·대화방·사이드바 배지는 평소처럼 캐시를 구독한다.
 */
export const ChatRealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  useChatRealtime({
    // 옛 저장값에는 사용자 id 가 없다 — 그 상태로는 내 메시지를 가려낼 수 없어 열지 않는다
    myUserId: user?.userId ?? null,
    isEnabled: isAuthenticated,
  });

  return <>{children}</>;
};
