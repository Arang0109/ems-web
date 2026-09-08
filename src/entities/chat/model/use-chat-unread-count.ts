import { unwrapMessage } from '@shared/api';
import { useEntityQuery } from '@shared/model';

import { chatApi } from '../api/api';
import { chatKeys } from './query-keys';

interface Props {
  /** 사용자 id 를 모르면(옛 저장값) 조회하지 않는다 — 갱신되지 않는 배지는 거짓 정보다 */
  enabled?: boolean;
}

/** 사이드바 전역 안읽음 배지. 응답 `data` 가 객체가 아니라 숫자다 */
export const useChatUnreadCount = ({ enabled = true }: Props = {}) =>
  useEntityQuery<number>({
    queryKey: chatKeys.unreadCount(),
    queryFn: async () => unwrapMessage(await chatApi.getUnreadCount()),
    initialData: 0,
    enabled,
  });
