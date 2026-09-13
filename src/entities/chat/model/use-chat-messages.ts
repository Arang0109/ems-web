import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { toQueryErrorMessage, unwrapMessage } from '@shared/api';

import { chatApi } from '../api/api';
import { toChatMessagePage } from '../api/mapper';
import { toMessageTimeline } from '../lib/message-timeline';
import { CHAT_PAGE_SIZE } from './constants';
import { chatKeys } from './query-keys';
import type { ChatMessage } from './types';

interface Props {
  /** null 이면 조회하지 않는다 */
  roomId: number | null;
}

/**
 * 대화 메시지 — 위로 스크롤하며 과거를 더 받는다.
 *
 * **`useEntityQuery` 를 쓰지 않는 유일한 조회 훅이다.** 그 어댑터는 `data: T` 단일 값
 * 계약이라 `hasMore`·`loadMore` 를 표현할 수 없다. 호출부가 하나뿐인 지금
 * `shared/model` 에 무한 조회 어댑터를 새로 세우는 것은 과설계라, `useMutation` 을 직접
 * 조립하는 액션 훅들과 같은 갈래로 둔다.
 *
 * `placeholderData` 를 지정하지 않는다 — 방을 바꿨는데 이전 방 메시지가 잠깐 남아 보이면
 * 남의 대화를 보여 주는 셈이 된다. 그 사이는 스켈레톤이 채운다.
 */
export const useChatMessages = ({ roomId }: Props) => {
  const query = useInfiniteQuery({
    queryKey: chatKeys.messageList(roomId as number),
    queryFn: async ({ pageParam }) =>
      toChatMessagePage(
        unwrapMessage(
          await chatApi.getMessagePage(roomId as number, {
            before: pageParam,
            size: CHAT_PAGE_SIZE,
          }),
        ),
      ),
    initialPageParam: undefined as string | undefined,
    // 여기서 "다음"은 **더 과거**다. 서버에 `after` 커서가 없어 방향이 하나뿐이다.
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: roomId != null,
  });

  const messages: ChatMessage[] = useMemo(
    () => toMessageTimeline(query.data?.pages ?? []),
    [query.data],
  );

  return {
    /** 오래된 것 → 새것 순. 페이지 간 겹침은 제거돼 있다 */
    messages,
    isLoading: query.isLoading,
    error: toQueryErrorMessage(query.error),
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: query.fetchNextPage,
  };
};
