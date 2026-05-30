import { useState } from 'react';
import type { SortingState, PaginationState } from '@tanstack/react-table';

interface UseTableStateOptions {
  pageSize?: number;
}

export const useTableState = ({ pageSize = 10 }: UseTableStateOptions = {}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  };
};
