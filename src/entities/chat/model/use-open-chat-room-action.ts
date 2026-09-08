import { unwrapMessage } from '@shared/api';
import { useEntityMutation } from '@shared/model';

import { chatApi } from '../api/api';
import { toChatRoom } from '../api/mapper';
import { chatKeys } from './query-keys';
import type { ChatRoom } from './types';

/**
 * 1:1 대화방 열기.
 *
 * **멱등이다** — 이미 있는 상대를 다시 고르면 서버가 그 방을 돌려준다. 감춰 뒀던 방이면
 * 목록에 되살아나므로 목록을 무효화한다.
 */
export const useOpenChatRoomAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (counterpartId: number): Promise<ChatRoom> =>
      toChatRoom(unwrapMessage(await chatApi.openRoom({ counterpartId }))),
    { invalidateKeys: [chatKeys.roomList()] },
  );

  return { openRoom: run, isLoading, error };
};
