import { useRef, useState } from 'react';

import { useReorderItemsAction } from '@entities/schedule';
import type { MeasurementItemSnapshot } from '@entities/schedule';
import { moveItem } from '@shared/lib';
import { toast } from '@shared/ui/toasts';

interface Props {
  scheduleId: number;
  items: MeasurementItemSnapshot[];
  /** 저장이 거절됐을 때 서버의 실제 순서를 다시 받아오기 위한 재조회 */
  onRefetch: () => void;
}

/**
 * 성적서 측정항목 순서 변경 (낙관적 업데이트).
 *
 * 이 순서가 곧 성적서의 항목 배치다 — 기록부 서식은 한 장에 실리는 항목 수가 정해져 있어
 * (대기측정기록부 4개) 템플릿이 `items[0]`~`items[3]` 처럼 인덱스로 칸을 지목한다.
 * 드롭·버튼 조작 즉시 화면을 먼저 바꾸고 서버에 저장하며, 실패하면 원래 순서로 되돌린다.
 *
 * **성공 시 재조회하지 않는다.** 서버는 우리가 보낸 순서를 그대로 저장했으므로 화면이 이미 정답이고,
 * 상세 재조회는 탭·열어둔 섹션을 리셋해 목록이 깜빡인다.
 *
 * **성공 toast 도 띄우지 않는다.** 순서 변경은 드래그마다 연속으로 일어나 토스트가 쌓인다.
 * 항목이 즉시 재배열되고 순위 배지 숫자가 바뀌는 것 자체가 피드백이다.
 * (배출시설 순서 변경 `useReorderFacilities` 와 같은 관행이다.)
 */
export const useReorderScheduleItems = ({ scheduleId, items, onRefetch }: Props) => {
  const { reorderItems, isLoading } = useReorderItemsAction();

  // 서버 목록 위에 얹는 낙관적 순서. null 이면 서버 목록을 그대로 쓴다.
  const [optimistic, setOptimistic] = useState<MeasurementItemSnapshot[] | null>(null);

  // 항목 교체·정정 후 서버 목록이 갈리면 낙관적 순서를 버린다.
  // useEffect + setState 는 cascading render 를 만들므로, 렌더 중에 바로 조정한다.
  const [syncedItems, setSyncedItems] = useState(items);
  if (syncedItems !== items) {
    setSyncedItems(items);
    setOptimistic(null);
  }

  // 빠르게 연속으로 드롭하면 요청이 서로 추월할 수 있다. 최신 요청의 실패만 롤백에 반영한다.
  const requestIdRef = useRef(0);

  const ordered = optimistic ?? items;

  const handleReorder = async (from: number, to: number) => {
    // 첫 항목의 위 버튼·마지막 항목의 아래 버튼은 비활성이지만, 방어적으로 한 번 더 막는다
    const isNoop = from === to || from < 0 || to < 0 || from >= ordered.length || to >= ordered.length;
    if (isNoop) return;

    const previous = ordered;
    const next = moveItem(ordered, from, to);
    setOptimistic(next);

    const requestId = ++requestIdRef.current;

    try {
      await reorderItems(scheduleId, next.map((item) => item.pollutantId));
    } catch (err) {
      if (requestIdRef.current !== requestId) return;

      setOptimistic(previous);
      toast.error(err instanceof Error ? err.message : '순서 변경에 실패했습니다.');
      // 항목 자체가 서버에서 바뀌어 거절됐을 수 있으므로 최신 상태를 다시 받는다
      onRefetch();
    }
  };

  return { items: ordered, isLoading, handleReorder };
};
