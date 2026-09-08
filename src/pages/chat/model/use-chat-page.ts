import { useParams } from 'react-router';

import { useAuth } from '@entities/auth';
import { useIsMobile } from '@shared/model';

/**
 * 채팅 화면의 배치 판정.
 *
 * 라우트는 `/chat` 과 `/chat/:roomId` 둘이지만 **페이지 컴포넌트는 하나**다.
 * 데스크탑은 두 경로에서 모두 목록을 띄우고 대화만 갈아 끼우며, 모바일은 좁아서
 * 한 번에 하나만 보여 준다. 그래도 URL 이 대화를 가리키므로 새로고침·뒤로가기·
 * 링크 공유가 모두 성립한다.
 */
export const useChatPage = () => {
  const { roomId: roomIdParam } = useParams<{ roomId: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const parsed = Number(roomIdParam);
  const roomId = roomIdParam && Number.isFinite(parsed) ? parsed : null;

  return {
    roomId,
    /**
     * 내 사용자 id. `null` 이면 채팅을 쓸 수 없다 — 이 필드가 생기기 전에 로그인해 둔
     * 경우이고, 내 말풍선과 상대 말풍선을 가려낼 방법이 없다. 재로그인이 답이다.
     */
    myUserId: user?.userId ?? null,
    isMobile,
    showList: !isMobile || roomId === null,
    showRoom: !isMobile || roomId !== null,
  };
};
