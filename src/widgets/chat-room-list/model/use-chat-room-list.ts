import { useMemo, useState } from 'react';

import { useChatRooms } from '@entities/chat';

import { matchesChatRoomQuery, toChatRoomListRow } from './mapper';
import type { ChatRoomListRow } from './types';

/**
 * 대화 목록의 상태 — 조회 결과와 검색어.
 *
 * 검색은 이미 받아 온 목록을 거르는 것이라 서버로 나가지 않는다. 1:1 대화방 수는
 * 같은 회사 인원을 넘지 않으므로 전부 받아 두고 화면에서 좁히는 편이 빠르다.
 */
export const useChatRoomList = () => {
  const [query, setQuery] = useState('');
  const { data, isLoading, error } = useChatRooms();

  const rows = useMemo(() => data.map(toChatRoomListRow), [data]);

  const visibleRows: ChatRoomListRow[] = useMemo(
    () => rows.filter((row) => matchesChatRoomQuery(row, query)),
    [rows, query],
  );

  return {
    rows: visibleRows,
    /** 검색으로 가려진 것이 아니라 대화 자체가 없는 상태 — 빈 화면 문구가 갈린다 */
    isEmpty: rows.length === 0,
    query,
    setQuery,
    isLoading,
    error,
  };
};
