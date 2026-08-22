import { useRef, useState } from 'react';

import { useReorderFacilitiesAction } from '@entities/stack';
import type { Facility } from '@entities/stack';
import { moveItem } from '@shared/lib';
import { toast } from '@shared/ui/toasts';

interface Props {
  stackId: number;
  facilities: Facility[];
  /** 저장이 거절됐을 때 서버의 실제 순서를 다시 받아오기 위한 재조회 */
  onRefetch: () => void;
}

/**
 * 배출시설 표시 순서 변경 (낙관적 업데이트).
 *
 * 드롭·버튼 조작 즉시 화면을 먼저 바꾸고 서버에 저장한다. 실패하면 원래 순서로 되돌린다.
 *
 * **성공 시 재조회하지 않는다.** 서버는 우리가 보낸 순서를 그대로 저장했으므로 화면이 이미 정답이고,
 * `useStackDetail` 의 재조회는 데이터를 기본값으로 리셋해 목록이 깜빡이고 아코디언이 전부 닫힌다.
 *
 * **성공 toast 도 띄우지 않는다.** 이 저장소의 feature 훅 관행은 성공 시 `toast.success` 지만,
 * 그 관행은 모달 제출 같은 1회성 액션 기준이다. 순서 변경은 드래그마다 연속으로 일어나 토스트가 쌓인다.
 * 항목이 즉시 재배열되고 순위 배지 숫자가 바뀌는 것 자체가 피드백이다.
 */
export const useReorderFacilities = ({ stackId, facilities, onRefetch }: Props) => {
  const { reorderFacilities, isLoading } = useReorderFacilitiesAction();

  // 서버 목록 위에 얹는 낙관적 순서. null 이면 서버 목록을 그대로 쓴다.
  const [optimistic, setOptimistic] = useState<Facility[] | null>(null);

  // 등록·수정·삭제 후 서버 목록이 갈리면 낙관적 순서를 버린다.
  // useEffect + setState 는 cascading render 를 만들므로, 렌더 중에 바로 조정한다
  // (React 가 권장하는 "이전 렌더의 prop 과 비교해 파생 state 를 맞추는" 패턴).
  const [syncedFacilities, setSyncedFacilities] = useState(facilities);
  if (syncedFacilities !== facilities) {
    setSyncedFacilities(facilities);
    setOptimistic(null);
  }

  // 빠르게 연속으로 드롭하면 요청이 서로 추월할 수 있다. 최신 요청의 실패만 롤백에 반영한다.
  const requestIdRef = useRef(0);

  const items = optimistic ?? facilities;

  const handleReorder = async (from: number, to: number) => {
    // 첫 항목의 위 버튼·마지막 항목의 아래 버튼은 비활성이지만, 방어적으로 한 번 더 막는다
    const isNoop = from === to || from < 0 || to < 0 || from >= items.length || to >= items.length;
    if (isNoop) return;

    const previous = items;
    const next = moveItem(items, from, to);
    setOptimistic(next);

    const requestId = ++requestIdRef.current;

    try {
      await reorderFacilities(stackId, next.map((facility) => facility.id));
    } catch (err) {
      if (requestIdRef.current !== requestId) return;

      setOptimistic(previous);
      toast.error(err instanceof Error ? err.message : '순서 변경에 실패했습니다.');
      // 목록 자체가 서버에서 바뀌어 거절됐을 수 있으므로 최신 상태를 다시 받는다
      onRefetch();
    }
  };

  return { items, isLoading, handleReorder };
};
