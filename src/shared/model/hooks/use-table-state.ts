import { useMemo, useState } from 'react';
import type { OnChangeFn, SortingState, PaginationState } from '@tanstack/react-table';

interface UseTableStateOptions {
  pageSize?: number;
  /**
   * 페이지를 외부(URL 쿼리 등)가 소유할 때 넘긴다. 생략하면 내부 state 를 쓴다.
   * `onPageIndexChange` 와 함께 넘겨야 페이지 이동이 반영된다.
   */
  pageIndex?: number;
  onPageIndexChange?: (pageIndex: number) => void;
}

export const useTableState = ({
  pageSize = 10,
  pageIndex,
  onPageIndexChange,
}: UseTableStateOptions = {}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const isPageControlled = pageIndex !== undefined;

  // 매 렌더 새 객체를 만들면 TanStack 이 행 모델을 통째로 다시 계산한다
  const controlledPagination = useMemo<PaginationState>(
    () => ({ pageIndex: pageIndex ?? 0, pageSize }),
    [pageIndex, pageSize],
  );

  const pagination = isPageControlled ? controlledPagination : internalPagination;

  // TanStack 은 updater 함수를 넘기므로 외부 소유일 때는 여기서 풀어 페이지 번호만 올려보낸다.
  const setPagination: OnChangeFn<PaginationState> = (updater) => {
    if (!isPageControlled) return setInternalPagination(updater);

    const next = typeof updater === 'function' ? updater(pagination) : updater;
    onPageIndexChange?.(next.pageIndex);
  };

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  };
};
