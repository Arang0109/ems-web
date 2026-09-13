import { unwrapMessage } from '@shared/api';
import { useEntityQuery } from '@shared/model';

import { chatApi } from '../api/api';
import { toChatContact } from '../api/mapper';
import { chatKeys } from './query-keys';
import type { ChatContact } from './types';

/**
 * 대화 상대 목록 — 같은 테넌트에서 나를 뺀 전원.
 *
 * `useUsers`(`/users`)를 쓰지 않는다. 그 엔드포인트는 서버에 없고, 채팅에 필요한
 * `online` 도 담고 있지 않다.
 */
export const useChatContacts = () =>
  useEntityQuery<ChatContact[]>({
    queryKey: chatKeys.contacts(),
    queryFn: async () => (unwrapMessage(await chatApi.getContacts())).map(toChatContact),
    initialData: [],
  });
