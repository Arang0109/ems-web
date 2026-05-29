import { useState } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { Building2 } from 'lucide-react';

import type { Company, WorkplaceTableCols } from '@entities/company';

import { defaultColumns } from '../model/columns';

import { BasicTable, TableEmptyState } from '@shared/ui/table';
import { FormDialog } from '@shared/ui/dialogs';
import { Pagination } from '@shared/ui/pagination';

interface WorkplaceTableProps {
  data: WorkplaceTableCols[];
  loading: boolean;
  error: string | null;
  selectedCompany?: Company | null;
}

export const WorkplaceTable = ({
  data,
  loading,
  error,
  selectedCompany,
}: WorkplaceTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
  });

  const table = useReactTable({
    columns: defaultColumns,
    data,

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
            {selectedCompany ? (
              <p className="mt-0.5 text-xs text-blue-600 font-medium truncate">
                {selectedCompany.name}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400">
                의뢰기관을 선택해주세요
              </p>
            )}
          </div>
          <FormDialog
            triggerLabel='측정대상 사업장 등록'
            title='측정대상 사업장 등록'
            description='측정대상 사업장을 등록합니다.'
            children={<>cc</>}
          />
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-5 flex-1 flex flex-col">
        {!selectedCompany ? (
          <TableEmptyState
            icon={<Building2 size={22} className="text-gray-400" />}
            label='사업장 정보 없음'
            subLabel={<span>왼쪽에서 의뢰기관을 선택하면<br />해당 사업장 목록이 표시됩니다.</span>}
          />
        ) : (
          <>
            <BasicTable table={table} error={error} />
          </>
        )}
      </div>

      {/* 푸터: 건수 + 페이지네이션 */}
      {selectedCompany && !loading && !error && (
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
};
