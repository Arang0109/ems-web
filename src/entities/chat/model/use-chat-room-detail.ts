import { unwrapMessage } from '@shared/api';
import { useEntityQuery } from '@shared/model';

import { chatApi } from '../api/api';
import { toChatRoom } from '../api/mapper';
import { chatKeys } from './query-keys';
import type { ChatRoom } from './types';

interface Props {
  /** null 이면 조회하지 않는다 (아직 방을 고르지 않은 상태) */
  roomId: number | null;
}

/**
 * 대화방 상세 — 상대 정보와 **양쪽 읽음 커서**를 담고 있다.
 *
 * 목록에도 같은 값이 실려 오지만 상세를 따로 두는 이유는 URL 로 바로 들어온 경우다.
 * 목록에 없는 방(감춰 둔 방)이어도 화면이 서야 한다.
 */
export const useChatRoomDetail = ({ roomId }: Props) =>
  useEntityQuery<ChatRoom | null>({
    queryKey: chatKeys.roomDetail(roomId as number),
    queryFn: async () => toChatRoom(unwrapMessage(await chatApi.getRoom(roomId as number))),
    initialData: null,
    enabled: roomId != null,
  });
