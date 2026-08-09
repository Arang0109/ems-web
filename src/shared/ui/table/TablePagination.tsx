import type { Table } from '@tanstack/react-table';

import { Pagination } from '@shared/ui/pagination';

interface Props<TData> {
  table: Table<TData>;
}

/**
 * TanStack table 인스턴스를 제어형 `Pagination` 에 바인딩하는 어댑터.
 * `Pagination` 자체는 TanStack 을 모르는 순수 제어형으로 남겨둔다.
 */
export const TablePagination = <TData,>({ table }: Props<TData>) => (
  <Pagination
    pageIndex={table.getState().pagination.pageIndex}
    pageCount={table.getPageCount()}
    canPreviousPage={table.getCanPreviousPage()}
    canNextPage={table.getCanNextPage()}
    onPreviousPage={() => table.previousPage()}
    onNextPage={() => table.nextPage()}
    onPageChange={(index) => table.setPageIndex(index)}
  />
);
