import { unwrapMessage } from '@shared/api';
import { useEntityMutation } from '@shared/model';

import { chatApi } from '../api/api';
import { chatKeys } from './query-keys';

/**
 * 대화방 나가기 — 지우는 것이 아니라 **내 목록에서만 감춘다.**
 *
 * 대화 기록은 남고, 상대가 다시 말을 걸면 목록에 되돌아온다. 안읽음 합계가 달라지므로
 * 전역 배지도 함께 무효화한다.
 */
export const useHideChatRoomAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (roomId: number) => {
      unwrapMessage(await chatApi.hideRoom(roomId));
    },
    { invalidateKeys: [chatKeys.roomList(), chatKeys.unreadCount()] },
  );

  return { hideRoom: run, isLoading, error };
};
