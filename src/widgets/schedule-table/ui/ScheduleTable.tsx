import { useScheduleTable } from '../model/use-schedule-table';
import type { ScheduleTableRow } from '../model/types';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Pagination } from '@shared/ui/pagination';

interface Props {
  onRowClick?: (row: ScheduleTableRow) => void;
}

export const ScheduleTable = ({ onRowClick }: Props) => {
  const {
    table,

    globalFilter, setGlobalFilter,

    loading, error,
  } = useScheduleTable();

  return (
    <div>
      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 시설, 팀 검색 ...'} />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} onRowClick={onRowClick} />
      </div>

      {!loading && !error && (
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="inline-flex items-center gap-0.5 text-caption text-muted-foreground leading-none">
            총 <span className="font-semibold text-muted-foreground">{table.getFilteredRowModel().rows.length}</span>건
          </span>
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={() => table.previousPage()}
            onNextPage={() => table.nextPage()}
            onPageChange={(idx) => table.setPageIndex(idx)}
          />
        </div>
      )}
    </div>
  );
};
