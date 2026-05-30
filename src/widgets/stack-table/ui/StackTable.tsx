import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { useTableState } from '@shared/hooks';
import type { StackTableRow } from "@entities/stack";
import type { Workplace } from '@entities/workplace';

import { RegisterStackForm } from '@features/register-stack';

import { Building2 } from 'lucide-react';

import { toStackTableCols } from '../model/stack-table-types';
import { defaultColumns } from '../model/columns';

import { BasicTable, TableEmptyState } from '@shared/ui/table';
import { Search } from '@/shared/ui/form';
import { FormDialog } from '@shared/ui/dialogs';
import { Pagination } from '@shared/ui/pagination';

interface StackTableProps {
  data: StackTableRow[];
  loading: boolean;
  error: string | null;
  selectedWorkplace?: Workplace | null;
}

export const StackTable = ({
  data, loading, error, selectedWorkplace
}: StackTableProps) => {
  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 10 });

  const mappedData = useMemo(() => data.map(toStackTableCols), [data]);

  const table = useReactTable({
    columns: defaultColumns,
    data: mappedData,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800">사업장 목록</h2>
            {selectedWorkplace ? (
              <p className="mt-0.5 text-xs text-blue-600 font-medium truncate">
                {selectedWorkplace.name}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400">
                의뢰기관을 선택해주세요
              </p>
            )}
          </div>
          <FormDialog
            triggerLabel='측정대상 사업장 등록'
            children={<RegisterStackForm workplace={selectedWorkplace} />}
            disabled={selectedWorkplace ? false : true}
            submitLabel='등록'
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholer={'의뢰기관, 사업장, 시설, 측정분야 검색 ...'} />
      </div>

      {/* 컨텐츠 */}
      <div className="p-5 flex-1 flex flex-col">
        {!selectedWorkplace ? (
          <TableEmptyState
            icon={<Building2 size={22} className="text-gray-400" />}
            label='사업장 정보 없음'
            subLabel={<span>위쪽에서 사업장을 선택하면<br />해당 측정시설 목록이 표시됩니다.</span>}
          />
        ) : (
          <>
            <BasicTable table={table} error={error} />
          </>
        )}
      </div>

      {/* 푸터: 건수 + 페이지네이션 */}
      {!loading && !error && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400 leading-none">
            총 <span className="font-medium text-gray-600">{table.getFilteredRowModel().rows.length}</span>건
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
}