import { unwrapMessage } from '@shared/api';
import { useEntityQuery } from '@shared/model';

import { chatApi } from '../api/api';
import { toChatRoomListItem } from '../api/mapper';
import { chatKeys } from './query-keys';
import type { ChatRoomListItem } from './types';

/** 대화방 목록. 최근 대화 순이고 내가 감춘 방은 빠져 있다 */
export const useChatRooms = () =>
  useEntityQuery<ChatRoomListItem[]>({
    queryKey: chatKeys.roomList(),
    queryFn: async () => (unwrapMessage(await chatApi.getRoomList())).map(toChatRoomListItem),
    initialData: [],
  });
